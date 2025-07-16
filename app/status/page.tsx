"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, MessageSquare, Bot, Database, RefreshCw } from "lucide-react"
import Link from "next/link"

interface SystemStatus {
  component: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: string
}

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    setIsLoading(true)
    const status: SystemStatus[] = []

    try {
      // Check Environment Variables
      const envResponse = await fetch("/api/status/env")
      const envData = await envResponse.json()
      status.push({
        component: "Environment Variables",
        status: envData.botToken ? "healthy" : "error",
        message: envData.botToken ? "Bot token configured" : "Bot token missing",
        details: envData.chatId ? "Chat ID configured" : "Chat ID not set",
      })

      // Check Telegram Bot
      const botResponse = await fetch("/api/status/bot")
      const botData = await botResponse.json()
      status.push({
        component: "Telegram Bot",
        status: botData.success ? "healthy" : "error",
        message: botData.success ? `Bot active: ${botData.botInfo?.first_name}` : "Bot connection failed",
        details: botData.error || botData.botInfo?.username,
      })

      // Check Webhook Status
      const webhookResponse = await fetch("/api/status/webhook")
      const webhookData = await webhookResponse.json()
      status.push({
        component: "Webhook",
        status: webhookData.hasWebhook ? "healthy" : "warning",
        message: webhookData.hasWebhook ? "Webhook active" : "Using polling mode",
        details: webhookData.webhookUrl || "No webhook configured",
      })

      // Check Message System
      const messageResponse = await fetch("/api/messages")
      const messageData = await messageResponse.json()
      status.push({
        component: "Message System",
        status: "healthy",
        message: "In-memory storage active",
        details: `${messageData.messages?.length || 0} messages stored`,
      })

      // Database Status (Optional)
      status.push({
        component: "Database",
        status: "warning",
        message: "Using in-memory storage",
        details: "Messages will be lost on restart. Database integration available if needed.",
      })
    } catch (error) {
      status.push({
        component: "System Check",
        status: "error",
        message: "Failed to check system status",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }

    setSystemStatus(status)
    setLastCheck(new Date())
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const healthyCount = systemStatus.filter((s) => s.status === "healthy").length
  const totalCount = systemStatus.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            System Status
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={checkSystemStatus} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline">Back to Chat</Button>
            </Link>
          </div>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall System Health</span>
              <Badge variant={healthyCount === totalCount ? "default" : healthyCount > 0 ? "secondary" : "destructive"}>
                {healthyCount}/{totalCount} Healthy
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(healthyCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round((healthyCount / totalCount) * 100)}%</span>
            </div>
            {lastCheck && <p className="text-sm text-gray-600 mt-2">Last checked: {lastCheck.toLocaleTimeString()}</p>}
          </CardContent>
        </Card>

        {/* Component Status */}
        <div className="grid gap-4">
          {systemStatus.map((item, index) => (
            <Card key={index} className={getStatusColor(item.status)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold">{item.component}</h3>
                      <p className="text-sm text-gray-700">{item.message}</p>
                      {item.details && <p className="text-xs text-gray-600 mt-1">{item.details}</p>}
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "healthy" ? "default" : item.status === "warning" ? "secondary" : "destructive"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Bot className="h-4 w-4 mr-2" />
                Configure Bot
              </Button>
            </Link>
            <Link href="/env-setup">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Database className="h-4 w-4 mr-2" />
                Environment Setup
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chatting
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Database Status:</strong> Currently using in-memory storage. Your chat works perfectly, but messages
            are cleared when the server restarts. This is fine for development and testing!
            <br />
            <br />
            <strong>Want persistent storage?</strong> You can add database integration later with Supabase, PostgreSQL,
            or other providers.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
