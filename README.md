# Real-time Chat with Telegram Bot Integration

A real-time chat application with Telegram bot integration, featuring webhooks, push notifications, and two-way communication.

## 🚀 Features

- Real-time web chat interface
- Telegram bot integration with webhooks
- Two-way message synchronization
- Push notifications to Telegram
- Easy environment setup
- Responsive design

## 📋 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
TELEGRAM_BOT_TOKEN=8191916988:AAFHPmITZpUJs8tQJC6h9VvX9Wa5mAOIdrYto
TELEGRAM_CHAT_ID=your_chat_id_here
WEBHOOK_SECRET=your_webhook_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
\`\`\`

### 2. Get Your Chat ID

1. Start the development server: `npm run dev`
2. Go to `http://localhost:3000/settings`
3. Click "Find My Chat ID"
4. Send a message to your bot on Telegram
5. Select your chat from the list

### 3. Set Up Webhook (Optional)

1. Go to `http://localhost:3000/settings` → Webhook Setup
2. Click "Set Webhook"
3. Test two-way communication

## 🛠️ Environment Setup Helper

Visit `http://localhost:3000/env-setup` for:

- Environment variables status check
- Automatic .env file generation
- Step-by-step setup instructions
- Download ready-to-use .env.local file

## 📱 Usage

1. **Web Chat**: Visit the main page to join the chat
2. **Telegram Integration**: Messages sync between web and Telegram
3. **Notifications**: Toggle push notifications on/off
4. **Real-time**: Instant message delivery with webhooks

## 🔧 Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production

\`\`\`env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
WEBHOOK_SECRET=strong_random_secret
NEXTAUTH_SECRET=strong_random_secret
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
\`\`\`

## 🔐 Security

- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Webhook URLs must be HTTPS in production
- Rotate secrets regularly

## 📚 API Endpoints

- `POST /api/messages` - Send/receive chat messages
- `POST /api/telegram-notify` - Send notifications to Telegram
- `POST /api/telegram-webhook` - Receive Telegram updates
- `POST /api/telegram-webhook-setup` - Manage webhook configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
#   r e a l - t i m e - c h a t  
 