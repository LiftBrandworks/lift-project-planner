import {
  PlannerAnswers,
  PlannerConfig,
  Recommendation,
  Service
} from "@/types/planner";

function getService(services: Service[], id: string) {
  const service = services.find((item) => item.id === id);

  if (!service) {
    throw new Error(`Missing service: ${id}`);
  }

  return service;
}

function hasStrongBuildBudget(budget: string) {
  return budget === "1500-3000" || budget === "3000-plus";
}

function hasLowerBuildBudget(budget: string) {
  return budget === "under-500" || budget === "500-1500";
}

function uniqueExtras(extras: Service[], mainService: Service) {
  return extras
    .filter((service) => service.id !== mainService.id)
    .filter(
      (service, index, all) =>
        all.findIndex((item) => item.id === service.id) === index
    )
    .slice(0, 2);
}

export function getRecommendation(
  answers: PlannerAnswers,
  config: PlannerConfig
): Recommendation {
  const services = config.services;
  const review = getService(services, "website-review");
  const seo = getService(services, "seo-review");
  const copy = getService(services, "copy-refresh");
  const siteUpdate = getService(services, "site-update");
  const ecommerce = getService(services, "ecommerce");
  const websiteBuild = getService(services, "website-build");
  const brandWebsite = getService(services, "brand-website");
  const notSure = getService(services, "not-sure");

  let mainService = notSure;
  let explanation =
    "A short discovery call is the best first move. It will help clarify what you need, what can wait, and what will make the biggest difference.";
  const extras: Service[] = [];

  if (answers.need === "brand-website" || answers.priority === "brand-refresh") {
    mainService = brandWebsite;
    explanation =
      "Your answers point towards a joined-up brand and website project, so the work can cover identity, messaging and the site itself in one clear process.";
    extras.push(copy, seo);
  } else if (
    answers.need === "ecommerce" &&
    (answers.website === "no-site" || answers.website === "replace")
  ) {
    mainService = websiteBuild;
    explanation =
      "Because you need ecommerce and a new or replacement site, the strongest route is a full build with store setup included as a key extra.";
    extras.push(ecommerce, copy);
  } else if (
    answers.need === "ecommerce" ||
    answers.priority === "selling-online"
  ) {
    mainService = ecommerce;
    explanation =
      "You are focused on selling online, so the priority is getting products, pages and checkout set up properly in Squarespace.";
    extras.push(copy, seo);
  } else if (
    answers.need === "new-site" &&
    hasStrongBuildBudget(answers.budget)
  ) {
    mainService = websiteBuild;
    explanation =
      "You are ready for a new website and your budget range fits a full Squarespace build shaped around your goals and customers.";
    extras.push(copy, seo);
  } else if (
    answers.need === "new-site" &&
    hasLowerBuildBudget(answers.budget)
  ) {
    mainService = notSure;
    explanation =
      "A full new site may need phasing at this budget. A discovery call or focused action plan can map the smartest first step.";
    extras.push(review);
  } else if (
    answers.need === "google" ||
    answers.priority === "visibility"
  ) {
    mainService = seo;
    explanation =
      "Search visibility is the priority, so a practical SEO review and setup should give the site a clearer structure and stronger search signals.";
    extras.push(copy, review);
  } else if (answers.need === "copy" || answers.priority === "messaging") {
    mainService = copy;
    explanation =
      "Your answers suggest the site needs clearer language that guides visitors towards enquiries with more confidence.";
    extras.push(review, seo);
  } else if (
    answers.need === "improve-existing" &&
    answers.priority === "fixing"
  ) {
    mainService = review;
    explanation =
      "You want to understand what is working, what is getting in the way, and what to improve first. An action plan fits that perfectly.";
    extras.push(copy, seo);
  } else if (
    answers.need === "improve-existing" &&
    hasStrongBuildBudget(answers.budget)
  ) {
    mainService = siteUpdate;
    explanation =
      "You already have a site and enough budget for hands-on improvements across layout, structure and content.";
    extras.push(copy, seo);
  }

  return {
    mainService,
    extras: uniqueExtras(extras, mainService),
    explanation,
    nextStep:
      "Send your project brief and Lift Brandworks will review it before coming back with a clear recommendation."
  };
}
