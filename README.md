# Project Planner for Lift Brandworks

A responsive embeddable project scoping widget for Lift Brandworks. It helps visitors choose a service, see an estimated investment range, and send a short project brief.

The app is built with Next.js, React and TypeScript for deployment on Vercel. It is designed first as an iframe widget for Squarespace, while still working as a standalone hosted app.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Keep the framework preset as Next.js.
4. Add any environment variables listed below.
5. Deploy.

## Environment variables

`ADMIN_PASSWORD`

Password for `/admin`. Set this before using the admin page.

`RESEND_API_KEY`

Optional API key for sending project briefs through Resend.

`LEAD_EMAIL_TO`

Optional recipient email address for project briefs.

`LEAD_EMAIL_FROM`

Optional verified sender address for Resend. Defaults to `Project Planner <onboarding@resend.dev>`.

`SMTP_HOST`

Optional SMTP host used when Resend is not configured.

`SMTP_PORT`

Optional SMTP port. Defaults to `587`.

`SMTP_USER`

Optional SMTP username.

`SMTP_PASS`

Optional SMTP password.

`SMTP_FROM`

Optional SMTP sender address.

If email variables are not provided, the planner still works and saves submissions to localStorage in the visitor’s browser.

## Link from Squarespace using a button

Create a button in Squarespace and link it to the deployed Vercel URL, for example:

```text
https://your-project-planner-url.com
```

Use button text such as `Start Your Project`.

## Embed into Squarespace with an iframe

Add a Squarespace Code Block and paste:

```html
<div style="width:100%; max-width:100%; overflow:hidden;">
  <iframe
    id="lift-project-planner"
    src="https://your-project-planner-url.com"
    width="100%"
    height="900"
    scrolling="no"
    style="display:block; width:100%; border:0; border-radius:16px; overflow:hidden;"
  ></iframe>
</div>

<script>
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "project-planner:resize") return;

    var iframe = document.getElementById("lift-project-planner");
    if (!iframe) return;

    iframe.style.height = event.data.height + "px";
  });
</script>
```

Replace `https://your-project-planner-url.com` with the live HTTPS Vercel URL for the planner. For example, if Vercel gives you `https://lift-project-planner.vercel.app`, use that as the iframe `src`.

Do not use `https://liftbrandworks.com` as the iframe `src` unless the planner has been deployed there as its own page. Do not use `localhost`, because Squarespace visitors cannot reach a local development server.

If Squarespace strips the script from the Code Block, use the simpler fallback below and adjust the height manually:

```html
<iframe src="https://your-project-planner-url.com" width="100%" height="1100" style="display:block; width:100%; border:0; border-radius:16px; overflow:hidden;"></iframe>
```

The height may need adjusting depending on the Squarespace section layout.

## Change questions, services, pricing and branding

Edit `config/client-config.ts`.

The planner reads business name, colours, landing copy, services, prices, questions and options from that file. The recommendation rules live in `lib/recommendation.ts`, so future white-labelled versions can swap the config first and only adjust rules when the offer logic changes.

For a future SaaS version, `config/client-config.ts` can be replaced with a JSON file or database-backed client configuration.
