"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Bell, Bot, CheckCircle, AlertCircle, Webhook } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  notified?: boolean
  source?: string
}

// Read the Chat ID from a PUBLIC env var so the client can access it.
// Add NEXT_PUBLIC_TELEGRAM_CHAT_ID=123456789 to your .env.local
const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("")
  const [notifications, setNotifications] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // New states for the setup flow
  const [setupStep, setSetupStep] = useState<
    "token_input" | "webhook_registering" | "webhook_result" | "username_input" | "chat_active"
  >("token_input")
  // ----------------------------------------------------------------------------------------------------
  // IMPORTANT: Replace 'YOUR_NEW_BOT_TOKEN_HERE' with the token you got from @BotFather in Step 1.
  // This is used for the initial setup flow.
  // ----------------------------------------------------------------------------------------------------
  const [botTokenInput, setBotTokenInput] = useState("") // <--- UPDATE THIS LINE
  const [webhookStatus, setWebhookStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isWebhookLoading, setIsWebhookLoading] = useState(false)

  // Simulate real-time by polling for new messages
  useEffect(() => {
    if (setupStep !== "chat_active") return

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/messages")
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [setupStep])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const registerWebhook = async () => {
    if (!botTokenInput.trim()) {
      setWebhookStatus({ type: "error", message: "Please enter your Telegram Bot Token." })
      return
    }

    setIsWebhookLoading(true)
    setWebhookStatus(null)
    setSetupStep("webhook_registering")

    try {
      const currentDomain = window.location.origin
      const webhookUrl = `https://real-time-chat-coral-seven.vercel.app/telegram-webhook`

      const response = await fetch("/api/telegram-webhook-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set",
          webhookUrl: webhookUrl,
          botToken: botTokenInput, // Pass the token from input
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setWebhookStatus({
          type: "success",
          message: "Webhook registered successfully! You can now enter your username.",
        })
        setSetupStep("webhook_result")
      } else {
        setWebhookStatus({
          type: "error",
          message: data.error || "Failed to register webhook. Please check your token.",
        })
        setSetupStep("webhook_result")
      }
    } catch (error) {
      setWebhookStatus({
        type: "error",
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
      setSetupStep("webhook_result")
    } finally {
      setIsWebhookLoading(false)
    }
  }

  const proceedToUsername = () => {
    setSetupStep("username_input")
  }

  const joinChat = () => {
    if (username.trim()) {
      setSetupStep("chat_active")
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !username.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: username,
      timestamp: new Date(),
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (response.ok) {
        setNewMessage("")

        // Send Telegram notification if enabled
        if (notifications) {
          try {
            const notifyResponse = await fetch("/api/telegram-notify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: `New message from ${username}: ${newMessage}`,
                chatId: CHAT_ID, // Use the public chat ID from env
                botToken: botTokenInput, // Use the user-provided token for this call
              }),
            })

            const notifyData = await notifyResponse.json()

            if (!notifyData.success) {
              console.error("Telegram notification failed:", notifyData.error)
              // You could show a toast notification here
            }
          } catch (error) {
            console.error("Failed to send Telegram notification:", error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Render different screens based on setupStep
  if (setupStep === "token_input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Bot className="h-6 w-6" />
              Telegram Bot Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-token">Your Telegram Bot Token</Label>
              <Input
                id="bot-token"
                placeholder="e.g., 123456:ABC-DEF1234ghIkl-zyx57W2E1u"
                value={botTokenInput}
                onChange={(e) => setBotTokenInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && registerWebhook()}
              />
              <p className="text-sm text-gray-500">
                Get this from{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  @BotFather
                </a>{" "}
                on Telegram.
              </p>
            </div>
            <Button onClick={registerWebhook} className="w-full" disabled={!botTokenInput.trim() || isWebhookLoading}>
              {isWebhookLoading ? "Registering Webhook..." : "Register Webhook"}
            </Button>
            {webhookStatus && (
              <Alert variant={webhookStatus.type === "error" ? "destructive" : "default"}>
                {webhookStatus.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{webhookStatus.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (setupStep === "webhook_registering") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Webhook className="h-6 w-6 animate-spin" />
              Registering Webhook...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            Please wait while we set up your Telegram bot webhook.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (setupStep === "webhook_result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {webhookStatus?.type === "success" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              Webhook Registration Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhookStatus && (
              <Alert variant={webhookStatus.type === "error" ? "destructive" : "default"}>
                {webhookStatus.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{webhookStatus.message}</AlertDescription>
              </Alert>
            )}
            {webhookStatus?.type === "success" ? (
              <Button onClick={proceedToUsername} className="w-full">
                Proceed to Chat
              </Button>
            ) : (
              <Button onClick={() => setSetupStep("token_input")} className="w-full" variant="outline">
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (setupStep === "username_input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Join Real-time Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && joinChat()}
            />
            <Button onClick={joinChat} className="w-full" disabled={!username.trim()}>
              Join Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default: chat_active
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Real-time Chat
              <Badge variant="secondary" className="ml-2">
                {username}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifications(!notifications)}
              className={notifications ? "bg-green-50" : "bg-gray-50"}
            >
              <Bell className={`h-4 w-4 mr-2 ${notifications ? "text-green-600" : "text-gray-400"}`} />
              {notifications ? "Notifications ON" : "Notifications OFF"}
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-4">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === username
                            ? "bg-blue-500 text-white"
                            : message.source === "telegram"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1 flex items-center gap-1">
                          {message.sender}
                          {message.source === "telegram" && (
                            <Badge variant="secondary" className="text-xs">
                              Telegram
                            </Badge>
                          )}
                        </div>
                        <div>{message.text}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
