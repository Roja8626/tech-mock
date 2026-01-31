<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zHwvFWssCfKxK9pwE90J6ioPs8OCZcoe

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

> Note: If `GEMINI_API_KEY` is not set, the app will return local mock questions so the UI remains usable. For production, never expose secret API keys in client-side/browser code — proxy requests through a server or serverless endpoint and keep secrets server-side.
