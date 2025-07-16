"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bot, MessageSquare, Search, CheckCircle, AlertCircle, Webhook, Globe, Trash2 } from "lucide-react"
import Link from "next/link"

interface ChatInfo {
  id: string
  type: string
  title: string
  username?: string
}

interface WebhookInfo {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
  max_connections?: number
  allowed_updates?: string[]
}

export default function SettingsPage() {
  // ----------------------------------------------------------------------------------------------------
  // IMPORTANT: Replace 'YOUR_NEW_BOT_TOKEN_HERE' with the token you got from @BotFather in Step 1.
  // ----------------------------------------------------------------------------------------------------
  const [botToken] = useState("8191916988:AAFHPmITZpUJs8tQJC6h9VvX9Wa5mAOIdrYto") // <--- UPDATE THIS LINE
  const [selectedChatId, setSelectedChatId] = useState("")
  const [chatIds, setChatIds] = useState<ChatInfo[]>([])
  const [testMessage, setTestMessage] = useState("Hello from your chat app! 🚀")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null)
  const [status, setStatus] = useState<{ type: "success" | "error" | "info" | null; message: string }>({
    type: null,
    message: "",
  })
  const [isSearching, setIsSearching] = useState(false)
  const [isWebhookLoading, setIsWebhookLoading] = useState(false)

  // Auto-detect webhook URL based on current domain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentDomain = window.location.origin
      setWebhookUrl(`${currentDomain}/api/telegram-webhook`)
    }
  }, [])

  // Load webhook info on component mount
  useEffect(() => {
    loadWebhookInfo()
  }, [])

  const findChatIds = async () => {
    setIsSearching(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/telegram-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ botToken }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.hasMessages) {
          setChatIds(data.chatIds)
          setStatus({
            type: "success",
            message: `Found ${data.chatIds.length} chat(s)! Select one below.`,
          })
        } else {
          setStatus({
            type: "info",
            message: "No messages found. Send a message to your bot first, then try again.",
          })
        }
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to fetch chat information",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error occurred",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const loadWebhookInfo = async () => {
    try {
      const response = await fetch("/api/telegram-webhook-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "info" }),
      })

      const data = await response.json()
      if (data.success) {
        setWebhookInfo(data.webhookInfo)
      }
    } catch (error) {
      console.error("Failed to load webhook info:", error)
    }
  }

  const setupWebhook = async () => {
    if (!webhookUrl.trim()) return

    setIsWebhookLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/telegram-webhook-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set",
          webhookUrl: webhookUrl.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: "success",
          message: "Webhook set up successfully! Your bot can now receive messages in real-time.",
        })
        await loadWebhookInfo()
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to set up webhook",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error occurred",
      })
    } finally {
      setIsWebhookLoading(false)
    }
  }

  const deleteWebhook = async () => {
    setIsWebhookLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/telegram-webhook-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete" }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: "success",
          message: "Webhook deleted successfully! Bot is now using polling mode.",
        })
        setWebhookInfo(null)
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to delete webhook",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error occurred",
      })
    } finally {
      setIsWebhookLoading(false)
    }
  }

  const testTelegramBot = async () => {
    if (!testMessage.trim() || !selectedChatId) return

    try {
      const response = await fetch("/api/telegram-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `🧪 Test Message: ${testMessage}`,
          botToken,
          chatId: selectedChatId,
        }),
      })

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Test message sent successfully to Telegram! Check your chat.",
        })
      } else {
        const error = await response.json()
        setStatus({
          type: "error",
          message: error.error || "Failed to send test message",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error occurred",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Telegram Bot Setup
          </h1>
          <Link href="/">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Setup</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Bot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bot Token</Label>
                  <div className="flex items-center gap-2">
                    <Input value={botToken} disabled className="font-mono text-sm" />
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-sm text-green-600">✅ Bot token configured</p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next Step:</strong> Send a message to your bot on Telegram, then click "Find My Chat ID"
                    below.
                  </AlertDescription>
                </Alert>

                <Button onClick={findChatIds} disabled={isSearching} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Find My Chat ID"}
                </Button>

                {chatIds.length > 0 && (
                  <div className="space-y-3">
                    <Label>Select Your Chat:</Label>
                    <div className="space-y-2">
                      {chatIds.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedChatId === chat.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedChatId(chat.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{chat.title || "Private Chat"}</div>
                              <div className="text-sm text-gray-500">
                                ID: {chat.id} • Type: {chat.type}
                                {chat.username && ` • @${chat.username}`}
                              </div>
                            </div>
                            <Badge variant={chat.type === "private" ? "default" : "secondary"}>{chat.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedChatId && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Your Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-message">Test Message</Label>
                        <Input
                          id="test-message"
                          placeholder="Enter a test message"
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                        />
                      </div>

                      <Button onClick={testTelegramBot} className="w-full">
                        Send Test Message to Telegram
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhookInfo && webhookInfo.url ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      <strong>Webhook Active:</strong> {webhookInfo.url}
                      <br />
                      <span className="text-sm">
                        Pending updates: {webhookInfo.pending_update_count} • Max connections:{" "}
                        {webhookInfo.max_connections || 40}
                      </span>
                      {webhookInfo.last_error_message && (
                        <div className="mt-2 text-red-600">
                          <strong>Last Error:</strong> {webhookInfo.last_error_message}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      <strong>No webhook configured.</strong> Your bot is using polling mode. Set up a webhook for
                      real-time message delivery.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://yourdomain.com/api/telegram-webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-600">
                    This URL will receive updates from Telegram. Must be HTTPS in production.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={setupWebhook} disabled={isWebhookLoading || !webhookUrl.trim()} className="flex-1">
                    <Webhook className="h-4 w-4 mr-2" />
                    {isWebhookLoading ? "Setting up..." : "Set Webhook"}
                  </Button>

                  {webhookInfo?.url && (
                    <Button onClick={deleteWebhook} disabled={isWebhookLoading} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Webhook Benefits:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>Real-time message delivery (no polling delay)</li>
                      <li>Two-way communication (messages from Telegram appear in chat)</li>
                      <li>Lower server load and better performance</li>
                      <li>Instant notifications and responses</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {status.type && (
          <Alert
            className={
              status.type === "success"
                ? "border-green-200 bg-green-50"
                : status.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
            }
          >
            <AlertDescription
              className={
                status.type === "success"
                  ? "text-green-800"
                  : status.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }
            >
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>Required Environment Variables:</strong>
                <br />
                <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
                  TELEGRAM_BOT_TOKEN=8191916988:AAFHPmITZpUJs8tQJC6h9VvX9Wa5mAOIdrYto
                  <br />
                  TELEGRAM_CHAT_ID={selectedChatId || "your_chat_id_here"}
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
