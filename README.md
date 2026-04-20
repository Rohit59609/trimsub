# TrimSub - AI-Powered Subscription Manager 🚀

TrimSub is an intelligent subscription management platform designed to help users automatically track, analyze, and optimize their online subscriptions using a modern Next.js web dashboard and a real-time Chrome Extension.

## 🌟 Features

- **Chrome Extension Tracker**: Automatically detects and syncs active subscriptions seamlessly while you browse.
- **Unified Dashboard**: View all your subscriptions, usage data, and monthly spend analytics in one beautiful, centralized interface.
- **Smart Analytics**: Visualizes spending patterns through dynamic charts to help you identify "expense leakages" and unused services.
- **Real-time Synchronization**: Instantly passes and updates data between your browser extension and the main web app.

## 🛠 Tech Stack

- **Frontend & API**: [Next.js](https://nextjs.org/) (App Router), React
- **Styling**: Tailwind CSS
- **Browser Integration**: Chrome Extension API (Manifest V3)
- **Language**: TypeScript / JavaScript

## 🚀 Getting Started

### 1. Running the Web App (Dashboard)
1. Open your terminal and navigate to the web app directory:
   ```bash
   cd trimsub
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

### 2. Installing the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** using the toggle in the top-right corner.
3. Click **"Load unpacked"** and select the `trimsub-extension` folder from this repository.
4. Pin the TrimSub extension to your toolbar. It is now active and ready to communicate with your local dashboard!

## 📁 Repository Structure

- `/trimsub`: The Next.js web application, UI components, and backend API routes.
- `/trimsub-extension`: The Chrome extension source code (popup UI, background service workers, and content scripts).

---
*Built for Hackathon 3.0*
