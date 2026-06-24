"use client";

import { FormEvent, useMemo, useState } from "react";
import { getRecommendation } from "@/lib/recommendation";
import {
  ContactDetails,
  PlannerAnswers,
  PlannerConfig,
  Question,
  StoredSubmission
} from "@/types/planner";

type PlannerStage = "landing" | "questions" | "contact" | "results" | "sent";

const emptyAnswers: PlannerAnswers = {
  need: "",
  website: "",
  priority: "",
  assets: [],
  budget: ""
};

const emptyContact: ContactDetails = {
  name: "",
  businessName: "",
  email: "",
  websiteUrl: "",
  notes: ""
};

const storageKey = "lift-project-planner-submissions";

export function ProjectPlanner({ config }: { config: PlannerConfig }) {
  const [stage, setStage] = useState<PlannerStage>("landing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PlannerAnswers>(emptyAnswers);
  const [contact, setContact] = useState<ContactDetails>(emptyContact);
  const [isSending, setIsSending] = useState(false);

  const currentQuestion = config.questions[questionIndex];
  const totalSteps = config.questions.length + 2;
  const activeStep =
    stage === "landing"
      ? 0
      : stage === "questions"
        ? questionIndex + 1
        : stage === "contact"
          ? config.questions.length + 1
          : totalSteps;
  const recommendation = useMemo(
    () => getRecommendation(answers, config),
    [answers, config]
  );

  function setSingleAnswer(question: Question, value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function toggleMultiAnswer(question: Question, value: string) {
    setAnswers((current) => {
      const selected = current[question.id] as string[];
      const nextSelected =
        value === "none"
          ? selected.includes("none")
            ? []
            : ["none"]
          : selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected.filter((item) => item !== "none"), value];

      return { ...current, [question.id]: nextSelected };
    });
  }

  function canContinue() {
    if (!currentQuestion) {
      return true;
    }

    const answer = answers[currentQuestion.id];
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
  }

  function goNext() {
    if (questionIndex < config.questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }

    setStage("contact");
  }

  function goBack() {
    if (stage === "contact") {
      setStage("questions");
      setQuestionIndex(config.questions.length - 1);
      return;
    }

    if (stage === "results") {
      setStage("contact");
      return;
    }

    if (questionIndex > 0) {
      setQuestionIndex((index) => index - 1);
      return;
    }

    setStage("landing");
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("results");
  }

  async function sendSubmission() {
    setIsSending(true);
    const submission: StoredSubmission = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      answers,
      contact,
      recommendation
    };

    const saved = window.localStorage.getItem(storageKey);
    const current: StoredSubmission[] = saved ? JSON.parse(saved) : [];
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([submission, ...current])
    );

    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
    } finally {
      setIsSending(false);
      setStage("sent");
    }
  }

  return (
    <main
      className="planner-shell"
      style={
        {
          "--primary-colour": config.primaryColour,
          "--accent-colour": config.accentColour
        } as React.CSSProperties
      }
    >
      <section className="planner-panel" aria-live="polite">
        {stage !== "landing" ? (
          <Progress activeStep={activeStep} totalSteps={totalSteps} />
        ) : null}

        {stage === "landing" ? (
          <div className="landing-grid">
            <div className="landing-copy">
              <div className="section-kicker">{config.businessName}</div>
              <h1>{config.landing.heading}</h1>
              <p>{config.landing.subheading}</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => setStage("questions")}
              >
                {config.landing.buttonLabel}
              </button>
            </div>
            <div className="service-preview" aria-label="Available services">
              {config.services.slice(0, 4).map((service) => (
                <div key={service.id}>
                  <span>{service.title}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {stage === "questions" && currentQuestion ? (
          <div className="stack">
            <div>
              <div className="section-kicker">
                Step {questionIndex + 1} of {config.questions.length}
              </div>
              <h2>{currentQuestion.title}</h2>
            </div>
            <OptionGroup
              answers={answers}
              question={currentQuestion}
              onSingleSelect={setSingleAnswer}
              onMultiSelect={toggleMultiAnswer}
            />
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={goBack}>
                Back
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={goNext}
                disabled={!canContinue()}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {stage === "contact" ? (
          <form className="stack" onSubmit={handleContactSubmit}>
            <div>
              <div className="section-kicker">Almost there</div>
              <h2>Tell me where to send the next step</h2>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input
                  required
                  value={contact.name}
                  onChange={(event) =>
                    setContact({ ...contact, name: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Business name</span>
                <input
                  required
                  value={contact.businessName}
                  onChange={(event) =>
                    setContact({
                      ...contact,
                      businessName: event.target.value
                    })
                  }
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={contact.email}
                  onChange={(event) =>
                    setContact({ ...contact, email: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Website URL, optional</span>
                <input
                  type="url"
                  value={contact.websiteUrl}
                  onChange={(event) =>
                    setContact({
                      ...contact,
                      websiteUrl: event.target.value
                    })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Short notes about the project</span>
              <textarea
                rows={5}
                value={contact.notes}
                onChange={(event) =>
                  setContact({ ...contact, notes: event.target.value })
                }
              />
            </label>
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={goBack}>
                Back
              </button>
              <button className="primary-button" type="submit">
                See Recommendation
              </button>
            </div>
          </form>
        ) : null}

        {stage === "results" ? (
          <div className="stack results">
            <div>
              <div className="section-kicker">Recommended package</div>
              <h2>{recommendation.mainService.title}</h2>
              <p>{recommendation.explanation}</p>
            </div>
            <div className="investment-band">
              <span>Estimated investment</span>
              <strong>{recommendation.mainService.price}</strong>
            </div>
            {recommendation.extras.length > 0 ? (
              <div>
                <h3>Useful extras</h3>
                <div className="extras-grid">
                  {recommendation.extras.map((extra) => (
                    <article key={extra.id}>
                      <strong>{extra.title}</strong>
                      <span>{extra.price}</span>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <h3>What happens next</h3>
              <p>{recommendation.nextStep}</p>
            </div>
            <div className="button-row">
              <button className="ghost-button" type="button" onClick={goBack}>
                Back
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={sendSubmission}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send My Project Brief"}
              </button>
            </div>
          </div>
        ) : null}

        {stage === "sent" ? (
          <div className="sent-message">
            <div className="section-kicker">Brief sent</div>
            <h2>Thanks, your project brief has been sent.</h2>
            <p>I’ll review it and come back with a clear next step.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Progress({
  activeStep,
  totalSteps
}: {
  activeStep: number;
  totalSteps: number;
}) {
  return (
    <div className="progress-wrap" aria-label={`Step ${activeStep} of ${totalSteps}`}>
      <div className="progress-meta">
        <span>Project Planner</span>
        <span>
          {activeStep}/{totalSteps}
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${(activeStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

function OptionGroup({
  answers,
  question,
  onSingleSelect,
  onMultiSelect
}: {
  answers: PlannerAnswers;
  question: Question;
  onSingleSelect: (question: Question, value: string) => void;
  onMultiSelect: (question: Question, value: string) => void;
}) {
  const selected = answers[question.id];

  return (
    <div className="option-grid">
      {question.options.map((option) => {
        const isSelected = Array.isArray(selected)
          ? selected.includes(option.id)
          : selected === option.id;

        return (
          <button
            className={isSelected ? "option-button selected" : "option-button"}
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() =>
              question.type === "multi"
                ? onMultiSelect(question, option.id)
                : onSingleSelect(question, option.id)
            }
          >
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
