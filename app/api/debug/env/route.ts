import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    botToken: !!process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID || null,
    webhookSecret: !!process.env.WEBHOOK_SECRET,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose actual values, just presence
    botTokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
    chatIdValue: process.env.TELEGRAM_CHAT_ID, // We can show this for debugging
  })
}
