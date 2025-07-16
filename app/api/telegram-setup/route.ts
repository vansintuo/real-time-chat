import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { botToken } = await request.json()

    if (!botToken) {
      return NextResponse.json({ error: "Bot token is required" }, { status: 400 })
    }

    // Get updates from Telegram to find chat ID
    const telegramUrl = `https://api.telegram.org/bot${botToken}/getUpdates`

    const response = await fetch(telegramUrl)

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid bot token or API error" }, { status: 400 })
    }

    const data = await response.json()

    // Extract chat IDs from recent messages
    const chatIds = new Set()
    if (data.result && data.result.length > 0) {
      data.result.forEach((update: any) => {
        if (update.message && update.message.chat) {
          chatIds.add({
            id: update.message.chat.id,
            type: update.message.chat.type,
            title:
              update.message.chat.title ||
              `${update.message.chat.first_name || ""} ${update.message.chat.last_name || ""}`.trim(),
            username: update.message.chat.username,
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      chatIds: Array.from(chatIds),
      hasMessages: data.result && data.result.length > 0,
    })
  } catch (error) {
    console.error("Telegram setup error:", error)
    return NextResponse.json({ error: "Failed to fetch Telegram data" }, { status: 500 })
  }
}
