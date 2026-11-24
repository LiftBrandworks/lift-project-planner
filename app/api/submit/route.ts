import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { plannerConfig } from "@/config/client-config";
import { getRecommendation } from "@/lib/recommendation";
import type { StoredSubmission } from "@/types/planner";

export const runtime = "nodejs";

type Message = { to: string; subject: string; text: string; replyTo: string };

async function deliver(message: Message, key: string) {
  const env = process.env;
  if (env.RESEND_API_KEY) {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": key
      },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || "Project Planner <onboarding@resend.dev>",
        to: [message.to], subject: message.subject, text: message.text, reply_to: message.replyTo
      })
    });
    return result.ok;
  }
  const from = env.SMTP_FROM || env.LEAD_EMAIL_FROM;
  if (!from || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return false;
  const port = Number(env.SMTP_PORT || 587);
  const smtp = nodemailer.createTransport({
    host: env.SMTP_HOST, port, secure: port === 465,
    auth: {user: env.SMTP_USER, pass: env.SMTP_PASS}
  });
  await smtp.sendMail({from, ...message});
  return true;
}

export async function POST(request: Request) {
  const data: StoredSubmission | null = await request.json().catch(() => null);
  const invalid = () => NextResponse.json({emailSent: false}, {status: 400});
  if (!data?.contact || !data.answers || typeof data.id !== "string" ||
      !/^[a-f\d-]{36}$/i.test(data.id)) return invalid();
  const {contact, answers} = data;
  if (![contact.name, contact.businessName, contact.email, contact.websiteUrl, contact.notes]
      .every(value => typeof value === "string" && value.length <= 5000) ||
      !contact.name.trim() || !contact.businessName.trim() ||
      !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(contact.email)) return invalid();

  const details: string[] = [];
  for (const question of plannerConfig.questions) {
    const answer = answers[question.id];
    const values = question.type === "multi" ? answer : [answer];
    if (!Array.isArray(values) || !values.length || values.length > question.options.length) return invalid();
    const labels = values.map(id => question.options.find(option => option.id === id)?.label);
    if (labels.some(label => !label)) return invalid();
    details.push(`${question.title} ${labels.join(", ")}`);
  }
  const rec = getRecommendation(answers, plannerConfig);
  const recommendation = [rec.mainService.title, rec.mainService.price, rec.explanation].join("\n");
  const inbox = process.env.LEAD_EMAIL_TO;
  if (!inbox) return NextResponse.json({emailSent: false}, {status: 503});
  const brief = [contact.name, contact.businessName, contact.email, contact.websiteUrl, ...details,
    contact.notes, recommendation, ...rec.extras.map(extra => `Optional: ${extra.title} — ${extra.price}`)]
    .filter(Boolean).join("\n\n");
  let emailSent = false;
  let visitorEmailSent = false;
  try {
    emailSent = await deliver({to: inbox, replyTo: contact.email, subject: "New Project Planner brief", text: brief}, `brief-${data.id}`);
    if (emailSent) {
      visitorEmailSent = await deliver({
        to: contact.email, replyTo: inbox, subject: "Your website project starting point",
        text: ["Thanks for sharing your project with Lift Brandworks.", "Based on your answers, I’d start here:",
          recommendation, "This is an initial estimate. I’ll review your brief and follow up to confirm the scope and price. You can reply directly to this email.",
          "Warm regards,\nRob\nLift Brandworks"].join("\n\n")
      }, `estimate-${data.id}`);
    }
  } catch { /* Report which delivery was accepted, including partial delivery. */ }
  return NextResponse.json({emailSent, visitorEmailSent}, {status: emailSent ? 200 : 503});
}
