import { type NextRequest, NextResponse } from "next/server"

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
      type: string
    }
    date: number
    text?: string
  }
}

// Store recent messages (in production, use a database)
const telegramMessages: any[] = []

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    console.log("Received Telegram webhook:", JSON.stringify(update, null, 2))

    // Verify the request is from Telegram (optional but recommended)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 400 })
    }

    // Process the incoming message
    if (update.message && update.message.text) {
      const message = update.message

      // Store the Telegram message
      const telegramMessage = {
        id: `telegram_${message.message_id}_${Date.now()}`,
        text: message.text,
        sender: `${message.from.first_name}${message.from.last_name ? ` ${message.from.last_name}` : ""} (Telegram)`,
        timestamp: new Date(message.date * 1000),
        source: "telegram",
        telegramUserId: message.from.id,
        telegramUsername: message.from.username,
      }

      telegramMessages.push(telegramMessage)

      // Also add to main chat messages
      const response = await fetch(`${request.nextUrl.origin}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(telegramMessage),
      })

      if (!response.ok) {
        console.error("Failed to add Telegram message to chat")
      }

      // Send a confirmation back to Telegram (optional)
      if (message.text.toLowerCase().includes("hello") || message.text.toLowerCase().includes("hi")) {
        await sendTelegramMessage(
          botToken,
          message.chat.id.toString(),
          `Hello ${message.from.first_name}! Your message has been received in the chat app. 👋`,
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  // Return recent Telegram messages for debugging
  return NextResponse.json({
    messages: telegramMessages.slice(-10),
    count: telegramMessages.length,
  })
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
    return false
  }
}
