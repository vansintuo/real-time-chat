import { type NextRequest, NextResponse } from "next/server"

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  notified?: boolean
}

// In-memory storage (in production, use a database)
let messages: Message[] = []

export async function GET() {
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  try {
    const message: Message = await request.json()
    messages.push(message)

    // Keep only last 100 messages to prevent memory issues
    if (messages.length > 100) {
      messages = messages.slice(-100)
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}

export async function DELETE() {
  messages = []
  return NextResponse.json({ success: true })
}
