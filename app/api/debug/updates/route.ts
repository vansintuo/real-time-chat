import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({
        success: false,
        error: "TELEGRAM_BOT_TOKEN not configured",
      })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=5`)
    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        updates: data.result,
        count: data.result.length,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || "Failed to get updates",
        telegramResponse: data,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
