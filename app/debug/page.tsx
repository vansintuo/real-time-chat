"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, MessageSquare, Send, Bug, RefreshCw, Copy } from "lucide-react"
import Link from "next/link"

interface DebugResult {
  step: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DebugPage() {
  const [testMessage, setTestMessage] = useState("🔧 Debug test message from chat app")
  const [chatId, setChatId] = useState("")
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const runFullDiagnostic = async () => {
    setIsDebugging(true)
    setDebugResults([])
    setLogs([])

    const results: DebugResult[] = []

    addLog("Starting full diagnostic...")

    // Step 1: Check Environment Variables
    addLog("Checking environment variables...")
    try {
      const envResponse = await fetch("/api/debug/env")
      const envData = await envResponse.json()

      results.push({
        step: "Environment Variables",
        status: envData.botToken && envData.chatId ? "success" : "error",
        message: envData.botToken && envData.chatId ? "All required variables present" : "Missing required variables",
        details: envData,
      })

      if (envData.chatId) {
        setChatId(envData.chatId)
      }

      addLog(`Bot Token: ${envData.botToken ? "✅ Present" : "❌ Missing"}`)
      addLog(`Chat ID: ${envData.chatId ? "✅ Present" : "❌ Missing"}`)
    } catch (error) {
      results.push({
        step: "Environment Variables",
        status: "error",
        message: "Failed to check environment variables",
        details: error,
      })
      addLog("❌ Failed to check environment variables")
    }

    // Step 2: Test Bot Connection
    addLog("Testing bot connection...")
    try {
      const botResponse = await fetch("/api/debug/bot")
      const botData = await botResponse.json()

      results.push({
        step: "Bot Connection",
        status: botData.success ? "success" : "error",
        message: botData.success ? `Bot connected: ${botData.botInfo?.first_name}` : "Bot connection failed",
        details: botData,
      })

      addLog(`Bot Status: ${botData.success ? "✅ Connected" : "❌ Failed"}`)
      if (botData.botInfo) {
        addLog(`Bot Name: ${botData.botInfo.first_name} (@${botData.botInfo.username})`)
      }
    } catch (error) {
      results.push({
        step: "Bot Connection",
        status: "error",
        message: "Failed to test bot connection",
        details: error,
      })
      addLog("❌ Failed to test bot connection")
    }

    // Step 3: Test Chat ID
    if (chatId) {
      addLog(`Testing message send to Chat ID: ${chatId}...`)
      try {
        const testResponse = await fetch("/api/debug/test-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "🔧 Debug test - checking if messages reach Telegram",
            chatId,
          }),
        })

        const testData = await testResponse.json()

        results.push({
          step: "Message Send Test",
          status: testData.success ? "success" : "error",
          message: testData.success ? "Test message sent successfully!" : "Failed to send test message",
          details: testData,
        })

        addLog(`Message Send: ${testData.success ? "✅ Success" : "❌ Failed"}`)
        if (testData.error) {
          addLog(`Error: ${testData.error}`)
        }
      } catch (error) {
        results.push({
          step: "Message Send Test",
          status: "error",
          message: "Failed to test message sending",
          details: error,
        })
        addLog("❌ Failed to test message sending")
      }
    } else {
      results.push({
        step: "Message Send Test",
        status: "warning",
        message: "Skipped - no Chat ID available",
        details: null,
      })
      addLog("⚠️ Skipping message test - no Chat ID")
    }

    // Step 4: Check Recent Updates
    addLog("Checking recent Telegram updates...")
    try {
      const updatesResponse = await fetch("/api/debug/updates")
      const updatesData = await updatesResponse.json()

      results.push({
        step: "Recent Updates",
        status: "success",
        message: `Found ${updatesData.updates?.length || 0} recent updates`,
        details: updatesData,
      })

      addLog(`Recent Updates: ${updatesData.updates?.length || 0} found`)
    } catch (error) {
      results.push({
        step: "Recent Updates",
        status: "error",
        message: "Failed to check recent updates",
        details: error,
      })
      addLog("❌ Failed to check recent updates")
    }

    setDebugResults(results)
    setIsDebugging(false)
    addLog("Diagnostic complete!")
  }

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !chatId.trim()) return

    addLog(`Sending test message: "${testMessage}"`)

    try {
      const response = await fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: testMessage,
          chatId: chatId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addLog("✅ Test message sent successfully!")
      } else {
        addLog(`❌ Failed to send: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Network error: ${error}`)
    }
  }

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="h-8 w-8" />
            Telegram Debug Center
          </h1>
          <Link href="/">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Full Diagnostic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Run a complete check of your Telegram integration</p>
              <Button onClick={runFullDiagnostic} disabled={isDebugging} className="w-full">
                {isDebugging ? "Running..." : "Run Full Diagnostic"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Chat ID</Label>
                <Input placeholder="Enter chat ID" value={chatId} onChange={(e) => setChatId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Test Message</Label>
                <Input
                  placeholder="Enter test message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>
              <Button onClick={sendTestMessage} disabled={!testMessage.trim() || !chatId.trim()} className="w-full">
                Send Test Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Results */}
        {debugResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {debugResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{result.step}</h4>
                      <Badge
                        variant={
                          result.status === "success"
                            ? "default"
                            : result.status === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Debug Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Debug Logs
                <Button variant="outline" size="sm" onClick={copyLogs}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={logs.join("\n")}
                readOnly
                className="font-mono text-sm h-40"
                placeholder="Debug logs will appear here..."
              />
            </CardContent>
          </Card>
        )}

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Messages not reaching Telegram?</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Check if TELEGRAM_CHAT_ID is set in your .env.local file</li>
                  <li>Verify you've sent a message to your bot first</li>
                  <li>Make sure notifications are enabled in the chat interface</li>
                  <li>Check if your bot token is correct</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>Quick Fix Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>
                    Go to{" "}
                    <Link href="/settings" className="text-blue-600 underline">
                      /settings
                    </Link>{" "}
                    and find your Chat ID
                  </li>
                  <li>Add TELEGRAM_CHAT_ID to your .env.local file</li>
                  <li>Restart your development server</li>
                  <li>Test again using the debug tools above</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
