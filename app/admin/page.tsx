"use client";

import { FormEvent, useMemo, useState } from "react";
import { plannerConfig } from "@/config/client-config";
import { StoredSubmission } from "@/types/planner";

const storageKey = "lift-project-planner-submissions";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);

  const sortedSubmissions = useMemo(
    () =>
      [...submissions].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [submissions]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError(
        response.status === 503
          ? "Set ADMIN_PASSWORD before using the admin page."
          : "That password did not work."
      );
      return;
    }

    const saved = window.localStorage.getItem(storageKey);
    setSubmissions(saved ? JSON.parse(saved) : []);
    setIsUnlocked(true);
  }

  return (
    <main className="planner-shell admin-shell">
      <section className="planner-panel">
        <div className="section-kicker">{plannerConfig.businessName}</div>
        <h1>Project Planner admin</h1>
        {!isUnlocked ? (
          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-button" type="submit">
              View submissions
            </button>
          </form>
        ) : (
          <div className="stack">
            <p className="muted">
              Showing submissions saved in this browser. Connect a database when
              you are ready to manage leads across devices.
            </p>
            {sortedSubmissions.length === 0 ? (
              <p>No submissions have been saved yet.</p>
            ) : (
              <div className="submission-list">
                {sortedSubmissions.map((submission) => (
                  <article className="submission-card" key={submission.id}>
                    <div>
                      <strong>{submission.contact.name}</strong>
                      <span>{submission.contact.email}</span>
                    </div>
                    <p>{submission.recommendation.mainService.title}</p>
                    <dl>
                      <div>
                        <dt>Business</dt>
                        <dd>{submission.contact.businessName || "Not given"}</dd>
                      </div>
                      <div>
                        <dt>Website</dt>
                        <dd>{submission.contact.websiteUrl || "Not given"}</dd>
                      </div>
                      <div>
                        <dt>Budget</dt>
                        <dd>{submission.answers.budget}</dd>
                      </div>
                    </dl>
                    {submission.contact.notes ? (
                      <p className="notes">{submission.contact.notes}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
