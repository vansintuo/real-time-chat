import { NextResponse } from "next/server"

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ hasWebhook: false, error: "Bot token not configured" })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
    const data = await response.json()

    if (data.ok) {
      const webhookInfo = data.result
      return NextResponse.json({
        hasWebhook: !!webhookInfo.url,
        webhookUrl: webhookInfo.url,
        pendingUpdates: webhookInfo.pending_update_count,
        lastError: webhookInfo.last_error_message,
      })
    } else {
      return NextResponse.json({
        hasWebhook: false,
        error: data.description || "Failed to get webhook info",
      })
    }
  } catch (error) {
    return NextResponse.json({
      hasWebhook: false,
      error: "Failed to check webhook status",
    })
  }
}
