import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json()
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({
        success: false,
        error: "TELEGRAM_BOT_TOKEN not configured",
      })
    }

    if (!chatId) {
      return NextResponse.json({
        success: false,
        error: "Chat ID is required",
      })
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()

    if (response.ok && data.ok) {
      return NextResponse.json({
        success: true,
        message: "Test message sent successfully!",
        telegramResponse: data,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || `HTTP ${response.status}: ${response.statusText}`,
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
