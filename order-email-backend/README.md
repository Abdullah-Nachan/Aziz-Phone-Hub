# Order Email Backend (Node.js + Nodemailer)

This backend sends an email notification to your Gmail whenever an order is confirmed on your website.

## Features
- Simple Express server
- Uses Nodemailer to send emails via Gmail
- CORS enabled for frontend integration
- Ready to deploy on Render, Railway, Vercel, etc.

## Setup

1. **Clone this repo or copy the files to your server.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Gmail:**
   - Enable 2-Step Verification on your Gmail account.
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
   - Generate an App Password for "Mail" and copy it.
   - Replace `YOUR_GMAIL@gmail.com` and `YOUR_APP_PASSWORD` in `index.js` with your actual Gmail and App Password.

## Running Locally

```bash
node index.js
```

## Deploying (e.g., Render, Railway, Vercel)
- Push this code to GitHub.
- Create a new web service on your chosen platform.
- Set environment variables if you prefer (GMAIL_USER, GMAIL_PASS) and update `index.js` to use them.
- Set start command: `node index.js`

## Usage

Send a POST request to `/notify-order` with order details:

```js
fetch('https://your-backend-url/notify-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order: { id: '123', amount: 500, ... } })
});
```

You will receive an email at your Gmail address with the order details.

---

**Note:**
- This backend is for notification only. Do not expose your App Password publicly.
- For production, use environment variables for sensitive data. 