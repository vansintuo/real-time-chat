import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ success: false, error: "Bot token not configured" })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        botInfo: data.result,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || "Bot API error",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to connect to Telegram API",
    })
  }
}
