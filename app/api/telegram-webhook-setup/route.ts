import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, webhookUrl } = await request.json()
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 400 })
    }

    if (action === "set" && webhookUrl) {
      // Set webhook
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
          drop_pending_updates: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.ok) {
        return NextResponse.json({
          success: true,
          message: "Webhook set successfully",
          data,
        })
      } else {
        return NextResponse.json(
          {
            error: data.description || "Failed to set webhook",
            data,
          },
          { status: 400 },
        )
      }
    } else if (action === "delete") {
      // Delete webhook
      const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drop_pending_updates: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.ok) {
        return NextResponse.json({
          success: true,
          message: "Webhook deleted successfully",
          data,
        })
      } else {
        return NextResponse.json(
          {
            error: data.description || "Failed to delete webhook",
            data,
          },
          { status: 400 },
        )
      }
    } else if (action === "info") {
      // Get webhook info
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
      const data = await response.json()

      if (response.ok && data.ok) {
        return NextResponse.json({
          success: true,
          webhookInfo: data.result,
        })
      } else {
        return NextResponse.json(
          {
            error: "Failed to get webhook info",
            data,
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Webhook setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
