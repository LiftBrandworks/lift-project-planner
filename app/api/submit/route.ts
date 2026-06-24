import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { StoredSubmission } from "@/types/planner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const submission = (await request.json()) as StoredSubmission;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_EMAIL_TO;
  const fromEmail = process.env.LEAD_EMAIL_FROM || "Project Planner <onboarding@resend.dev>";
  const summary = getSubmissionSummary(submission);

  if (!resendApiKey || !toEmail) {
    const smtpSent = await sendWithSmtp(summary);
    return NextResponse.json({ ok: true, emailSent: smtpSent });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: "New Project Planner brief",
      text: summary
    })
  });

  if (!response.ok) {
    return NextResponse.json({ ok: true, emailSent: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true, emailSent: true });
}

function getSubmissionSummary(submission: StoredSubmission) {
  return [
    `Name: ${submission.contact?.name || ""}`,
    `Business: ${submission.contact?.businessName || ""}`,
    `Email: ${submission.contact?.email || ""}`,
    `Website: ${submission.contact?.websiteUrl || ""}`,
    `Budget: ${submission.answers?.budget || ""}`,
    `Recommendation: ${submission.recommendation?.mainService?.title || ""}`,
    "",
    `Notes: ${submission.contact?.notes || ""}`
  ].join("\n");
}

async function sendWithSmtp(summary: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.SMTP_FROM || process.env.LEAD_EMAIL_FROM;

  if (!host || !user || !pass || !to || !from) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    await transporter.sendMail({
      from,
      to,
      subject: "New Project Planner brief",
      text: summary
    });

    return true;
  } catch {
    return false;
  }
}
