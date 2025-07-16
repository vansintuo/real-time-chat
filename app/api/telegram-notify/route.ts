import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1️⃣ Extract parameters
    // ------------------------------------------------------------------
    const {
      message,
      botToken: directBotToken,
      chatId: directChatId,
    }: { message: string; botToken?: string; chatId?: string | number } = await request.json()

    // Prefer explicit params → fall back to server-side env vars.
    const botToken = directBotToken || process.env.TELEGRAM_BOT_TOKEN
    const chatId: string | number | undefined =
      directChatId !== undefined && directChatId !== null && String(directChatId).trim() !== ""
        ? directChatId
        : process.env.TELEGRAM_CHAT_ID

    // ------------------------------------------------------------------
    // 2️⃣ Sanity-check the Chat ID
    // ------------------------------------------------------------------
    if (!botToken) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is missing" }, { status: 400 })

    if (!chatId)
      return NextResponse.json(
        { error: "Chat ID is missing – supply it in the request body or set TELEGRAM_CHAT_ID" },
        { status: 400 },
      )

    // Telegram accepts:
    //   • private chat       → positive number     (e.g. 123456789)
    //   • group/super-group  → negative number     (e.g. -987654321)
    //   • channel            → string "-100…"      (e.g. -1001234567890 as a string)
    // Convert numeric strings to numbers – otherwise keep as string.
    const chatIdStr = String(chatId).trim()
    const normalisedChatId =
      /^-?\d+$/.test(chatIdStr) && !chatIdStr.startsWith("-100")
        ? Number(chatIdStr) // private or basic group
        : chatIdStr // super-group / channel already in the right form

    // ------------------------------------------------------------------
    // 3️⃣ Fail fast for obviously wrong IDs
    // ------------------------------------------------------------------
    if (Number.isNaN(normalisedChatId) || `${normalisedChatId}`.length < 5)
      return NextResponse.json(
        {
          error:
            "Chat ID looks invalid. Open a DM with your bot, send ANY message, then call /getUpdates " +
            "or use the /settings page to grab the numeric ID.",
        },
        { status: 400 },
      )

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: normalisedChatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Telegram API error:", errorData)
      return NextResponse.json({ error: "Failed to send Telegram notification" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Telegram notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
