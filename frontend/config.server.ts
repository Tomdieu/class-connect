// Import with `import * as Sentry from "@sentry/nextjs"` if you are using ESM
const Sentry = require("@sentry/nextjs");

Sentry.init({
  dsn: "https://3d4add98283403db0afee014b3434b98@o4507198990647296.ingest.us.sentry.io/4509939263012864",
  integrations: [
    // Add the Vercel AI SDK integration to config.server.(js/ts)
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
  ],
  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});