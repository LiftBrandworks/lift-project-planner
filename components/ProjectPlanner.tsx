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
const stepLabels = [
  "Your Business",
  "Your Goals",
  "Website Needs",
  "Add-Ons",
  "Your Details"
];

const serviceIcons = ["store", "search", "edit"];
const trustItems = [
  { icon: "shield", label: "No obligation" },
  { icon: "clock", label: "Takes 2 minutes" },
  { icon: "lock", label: "Your details are safe" }
];

export function ProjectPlanner({ config }: { config: PlannerConfig }) {
  const [stage, setStage] = useState<PlannerStage>("landing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PlannerAnswers>(emptyAnswers);
  const [contact, setContact] = useState<ContactDetails>(emptyContact);
  const [isSending, setIsSending] = useState(false);

  const currentQuestion = config.questions[questionIndex];
  const totalSteps = config.questions.length;
  const activeStep =
    stage === "questions" ? questionIndex + 1 : stage === "landing" ? 1 : totalSteps;
  const recommendation = useMemo(
    () => getRecommendation(answers, config),
    [answers, config]
  );

  function setSingleAnswer(question: Question, value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    window.setTimeout(goNext, 140);
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
        <PlannerHeader
          activeStep={activeStep}
          businessName={config.businessName}
          heading={config.landing.heading}
          subheading={config.landing.subheading}
          totalSteps={totalSteps}
        />

        {stage === "landing" ? (
          <div className="landing-stack">
            <StepNav activeStep={activeStep} />
            <button
              className="primary-button hero-button"
              type="button"
              onClick={() => setStage("questions")}
            >
              <span>{config.landing.buttonLabel}</span>
              <Icon name="arrow" />
            </button>
            <div className="service-preview" aria-label="Popular services">
              <div className="section-rule">
                <span>Popular services</span>
              </div>
              <div className="service-list">
                {config.services.slice(0, 3).map((service, index) => (
                  <article className="service-row" key={service.id}>
                    <span className="service-icon" aria-hidden="true">
                      <Icon name={serviceIcons[index] ?? "store"} />
                    </span>
                    <span className="service-copy">
                      <strong>{service.title}</strong>
                      <span>{service.description}</span>
                    </span>
                    <span className="service-price">
                      <span>from</span>
                      <strong>{service.price}</strong>
                    </span>
                    <span className="service-arrow" aria-hidden="true">
                      <Icon name="chevron" />
                    </span>
                  </article>
                ))}
              </div>
            </div>
            <div className="trust-strip" aria-label="Project planner details">
              {trustItems.map((item) => (
                <span key={item.label}>
                  <Icon name={item.icon} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {stage === "questions" && currentQuestion ? (
          <div className="stack">
            <StepNav activeStep={activeStep} />
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
              {currentQuestion.type === "multi" ? (
                <button
                  className="primary-button"
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue()}
                >
                  Continue
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {stage === "contact" ? (
          <form className="stack" onSubmit={handleContactSubmit}>
            <StepNav activeStep={activeStep} />
            <div>
              <div className="section-kicker">Almost there</div>
              <h2>Send your brief</h2>
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
            <StepNav activeStep={activeStep} />
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

function PlannerHeader({
  activeStep,
  businessName,
  heading,
  subheading,
  totalSteps
}: {
  activeStep: number;
  businessName: string;
  heading: string;
  subheading: string;
  totalSteps: number;
}) {
  const progress = Math.max(0, Math.min(1, activeStep / totalSteps));

  return (
    <header className="planner-header">
      <div>
        <div className="section-kicker">{businessName}</div>
        <h1>{heading}</h1>
        <p>{subheading}</p>
      </div>
      <div
        className="progress-ring"
        style={{ "--progress": `${progress * 360}deg` } as React.CSSProperties}
        aria-label={`Step ${activeStep} of ${totalSteps}`}
      >
        <span>
          {activeStep}/{totalSteps}
        </span>
      </div>
    </header>
  );
}

function StepNav({ activeStep }: { activeStep: number }) {
  return (
    <nav className="step-nav" aria-label="Planner steps">
      {stepLabels.map((label, index) => {
        const step = index + 1;
        const isActive = step === activeStep;
        const isComplete = step < activeStep;

        return (
          <div
            className={[
              "step-item",
              isActive ? "active" : "",
              isComplete ? "complete" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            key={label}
          >
            <span className="step-node">
              <Icon name={["store", "target", "screen", "add", "user"][index]} />
            </span>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function Icon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {name === "store" ? (
        <>
          <path {...common} d="M4 10h16l-1.2-5.2A1 1 0 0 0 17.83 4H6.17a1 1 0 0 0-.97.8L4 10Z" />
          <path {...common} d="M6 10v9h12v-9" />
          <path {...common} d="M9 19v-5h6v5" />
          <path {...common} d="M4 10c.6 1.3 2.4 1.3 3 0 .6 1.3 2.4 1.3 3 0 .6 1.3 2.4 1.3 3 0 .6 1.3 2.4 1.3 3 0 .6 1.3 2.4 1.3 3 0" />
        </>
      ) : null}
      {name === "target" ? (
        <>
          <circle {...common} cx="12" cy="12" r="7" />
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M15 9l4-4" />
          <path {...common} d="M19 5v4h-4" />
        </>
      ) : null}
      {name === "screen" ? (
        <>
          <rect {...common} x="4" y="5" width="16" height="11" rx="1.5" />
          <path {...common} d="M8 20h8" />
          <path {...common} d="M12 16v4" />
        </>
      ) : null}
      {name === "add" ? (
        <>
          <path {...common} d="M12 5v14" />
          <path {...common} d="M5 12h14" />
          <path {...common} d="M17 7l-2-2h-6L7 7v10l2 2h6l2-2V7Z" />
        </>
      ) : null}
      {name === "user" ? (
        <>
          <circle {...common} cx="12" cy="8" r="3" />
          <path {...common} d="M5 20c1.4-3.5 4-5 7-5s5.6 1.5 7 5" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="11" cy="11" r="6" />
          <path {...common} d="M16 16l4 4" />
        </>
      ) : null}
      {name === "edit" ? (
        <>
          <path {...common} d="M4 20h4l11-11-4-4L4 16v4Z" />
          <path {...common} d="M13 7l4 4" />
        </>
      ) : null}
      {name === "arrow" ? (
        <>
          <path {...common} d="M5 12h14" />
          <path {...common} d="M13 6l6 6-6 6" />
        </>
      ) : null}
      {name === "chevron" ? <path {...common} d="M9 5l7 7-7 7" /> : null}
      {name === "shield" ? (
        <path {...common} d="M12 3l7 3v5c0 4.5-2.7 7.6-7 10-4.3-2.4-7-5.5-7-10V6l7-3Z" />
      ) : null}
      {name === "clock" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M12 8v5l3 2" />
        </>
      ) : null}
      {name === "lock" ? (
        <>
          <rect {...common} x="5" y="11" width="14" height="9" rx="1.5" />
          <path {...common} d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      ) : null}
    </svg>
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
