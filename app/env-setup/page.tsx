"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Copy,
  CheckCircle,
  AlertCircle,
  Download,
  Key,
  Database,
  Shield,
  Server,
} from "lucide-react";
import Link from "next/link";

interface EnvStatus {
  name: string;
  value?: string;
  required: boolean;
  status: "missing" | "present" | "configured";
  description: string;
}

export default function EnvSetupPage() {
  const [envVars, setEnvVars] = useState<EnvStatus[]>([]);
  const [customChatId, setCustomChatId] = useState("");
  const [customWebhookSecret, setCustomWebhookSecret] = useState("");
  const [generatedEnv, setGeneratedEnv] = useState("");

  useEffect(() => {
    checkEnvStatus();
    generateRandomSecrets();
  }, []);

  const generateRandomSecrets = () => {
    const webhookSecret = generateRandomString(32);
    const nextAuthSecret = generateRandomString(32);
    setCustomWebhookSecret(webhookSecret);

    updateGeneratedEnv(customChatId, webhookSecret, nextAuthSecret);
  };

  const generateRandomString = (length: number) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const checkEnvStatus = async () => {
    const envChecks: EnvStatus[] = [
      {
        name: "TELEGRAM_BOT_TOKEN",
        // ----------------------------------------------------------------------------------------------------
        // IMPORTANT: Replace 'YOUR_NEW_BOT_TOKEN_HERE' with the token you got from @BotFather in Step 1.
        // ----------------------------------------------------------------------------------------------------
        value: "8191916988:AAFHPmITZpUJs8tQJC6h9VvX9Wa5mAOIdrYto", // <--- UPDATE THIS LINE
        required: true,
        status: "configured",
        description: "Your Telegram bot token from @BotFather",
      },
      {
        name: "TELEGRAM_CHAT_ID",
        required: true,
        status: "missing",
        description: "Chat ID where notifications will be sent",
      },
      {
        name: "WEBHOOK_SECRET",
        required: false,
        status: "missing",
        description: "Secret for securing webhook endpoints",
      },
      {
        name: "NEXTAUTH_SECRET",
        required: false,
        status: "missing",
        description: "Secret for NextAuth.js session encryption",
      },
      {
        name: "NEXTAUTH_URL",
        value: "http://localhost:3000",
        required: false,
        status: "configured",
        description: "Base URL of your application",
      },
    ];

    setEnvVars(envChecks);
  };

  const updateGeneratedEnv = (
    chatId: string,
    webhookSecret: string,
    nextAuthSecret: string
  ) => {
    const envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8191916988:AAFHPmITZpUJs8tQJC6h9VvX9Wa5mAOIdrYto
TELEGRAM_CHAT_ID=${chatId || "your_chat_id_here"}

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${nextAuthSecret}

# Webhook Security
WEBHOOK_SECRET=${webhookSecret}

# App Configuration
NODE_ENV=development
PORT=3000

# Optional: Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Optional: Logging
LOG_LEVEL=info

# Optional: Database Configuration (uncomment if using database)
# DATABASE_URL=postgresql://username:password@localhost:5432/chatapp
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key`;

    setGeneratedEnv(envContent);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadEnvFile = () => {
    const blob = new Blob([generatedEnv], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env.local";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    updateGeneratedEnv(
      customChatId,
      customWebhookSecret,
      generateRandomString(32)
    );
  }, [customChatId, customWebhookSecret]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Environment Setup
          </h1>
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Bot Settings
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status Check</TabsTrigger>
            <TabsTrigger value="generator">Generate .env</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Environment Variables Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {envVars.map((env) => (
                  <div
                    key={env.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {env.name}
                        </code>
                        {env.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {env.description}
                      </p>
                      {env.value && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {env.value.length > 50
                            ? `${env.value.substring(0, 50)}...`
                            : env.value}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {env.status === "configured" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {env.status === "missing" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {env.status === "present" && (
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <Badge
                        variant={
                          env.status === "configured"
                            ? "default"
                            : env.status === "missing"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {env.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Generate Environment File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chat-id">Telegram Chat ID</Label>
                    <Input
                      id="chat-id"
                      placeholder="Enter your chat ID"
                      value={customChatId}
                      onChange={(e) => setCustomChatId(e.target.value)}
                    />
                    <p className="text-sm text-gray-600">
                      Get this from the Bot Settings page
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-secret"
                        value={customWebhookSecret}
                        onChange={(e) => setCustomWebhookSecret(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCustomWebhookSecret(generateRandomString(32))
                        }
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Generated .env.local File</Label>
                  <div className="relative">
                    <Textarea
                      value={generatedEnv}
                      readOnly
                      className="font-mono text-sm h-64"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(generatedEnv)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadEnvFile} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download .env.local
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedEnv)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Development Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. Create .env.local file</h4>
                    <p className="text-sm text-gray-600">
                      Create a <code>.env.local</code> file in your project root
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      2. Add environment variables
                    </h4>
                    <p className="text-sm text-gray-600">
                      Copy the generated content from the "Generate .env" tab
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">3. Get your Chat ID</h4>
                    <p className="text-sm text-gray-600">
                      Go to Bot Settings → Find Chat ID and update
                      TELEGRAM_CHAT_ID
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">4. Restart your app</h4>
                    <p className="text-sm text-gray-600">
                      Restart your development server to load the new variables
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Production Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Vercel Deployment</h4>
                    <p className="text-sm text-gray-600">
                      Add environment variables in your Vercel dashboard:
                      <br />
                      Settings → Environment Variables
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Other Platforms</h4>
                    <p className="text-sm text-gray-600">
                      • Netlify: Site settings → Environment variables
                      <br />• Railway: Variables tab in your project
                      <br />• Heroku: Settings → Config Vars
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Security Notes</h4>
                    <p className="text-sm text-gray-600">
                      • Never commit .env files to git
                      <br />• Use strong, unique secrets in production
                      <br />• Rotate secrets regularly
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Optional: Database Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertDescription>
                    <strong>Current:</strong> Messages are stored in memory
                    (lost on restart)
                    <br />
                    <strong>For Production:</strong> Add database configuration
                    for persistent storage
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <h4 className="font-semibold">Supabase Setup</h4>
                  <p className="text-sm text-gray-600">
                    1. Create a Supabase project at supabase.com
                    <br />
                    2. Get your project URL and API keys
                    <br />
                    3. Add SUPABASE_* variables to your .env file
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
