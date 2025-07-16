import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    return NextResponse.json({
      botToken: !!botToken,
      chatId: !!chatId,
      webhookSecret: !!process.env.WEBHOOK_SECRET,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check environment variables" }, { status: 500 })
  }
}
