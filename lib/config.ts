export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  app: {
    url: process.env.NEXTAUTH_URL,
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  security: {
    webhookSecret: process.env.WEBHOOK_SECRET,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
  rateLimit: {
    max: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"),
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
}

// Validation function
export function validateConfig() {
  const required = {
    TELEGRAM_BOT_TOKEN: config.telegram.botToken,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
  return true
}

// Helper to check if we're in production
export const isProduction = config.app.nodeEnv === "production"
export const isDevelopment = config.app.nodeEnv === "development"
