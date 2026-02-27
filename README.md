# FinancialApp

A comprehensive desktop application for financial management and tracking, built with modern web technologies wrapped in a native desktop experience.

## 🚀 Live Preview

## Backend API

Base URL: `https://financialapp-backend-cbnv.onrender.com/api/v1`

Check out the live preview: [https://64x-dev.github.io/view/](https://64x-dev.github.io/view/)

## 📚 Documentation

- API endpoint draft: [`scretch.md`](Docs/scretch.md)

## 🏗️ Project Structure

```
FinancialApp/
├── frontend/               # Main application
│   ├── src/                # React frontend source code
│   ├── src-tauri/          # Tauri desktop wrapper (Rust)
│   │   ├── src/            # Tauri backend logic
│   │   ├── Cargo.toml      # Rust dependencies
│   │   └── tauri.conf.json # Tauri configuration
│   └── package.json        # Frontend dependencies
├── backend/                # Backend services
│   ├── src/                # Source code
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Data models / schemas
│   │   ├── routes/         # API route definitions
│   │   └── app.js          # Entry point
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Example environment variables
└── LICENSE                 # Project license
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Tauri](https://tauri.app/) v2 (Desktop Application Wrapper)
- **UI Library**: [React](https://react.dev/) 18
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: JavaScript/TypeScript

### Tauri Integration
- **Desktop Wrapper**: Rust-based desktop application framework
- **Platform Support**: Windows, macOS, Linux
- **Native APIs**: File system, window management, system tray

## 📦 Features

- 💰 **Financial Tracking**: Comprehensive expense and income management
- 📊 **Analytics**: Visual reporting and insights
- 🔒 **Security**: Native desktop security with web technologies
- 🌐 **Cross-platform**: Runs on Windows, macOS, and Linux
- ⚡ **Performance**: Blazing fast with Tauri's Rust backend

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/) toolchain
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/)

### Cloning the Repository

```bash
# Clone the repository with all submodules
git clone --recurse-submodules https://github.com/your-username/FinancialApp.git

# Navigate to the project directory
cd FinancialApp
```

Or if you've already cloned without submodules:

```bash
# Initialize and update all submodules recursively
git submodule update --init --recursive
```

### Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or run as desktop app
npm run tauri dev
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run tauri dev    # Run as desktop app
npm run tauri build  # Build desktop application
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run tauri dev` - Run desktop application in dev mode
- `npm run tauri build` - Build distributable desktop app

## 📁 Project Organization

- **frontend/**: Main desktop application using Tauri + React
- **backend/**: Server-side services and APIs (planned)
- **docs/**: Project documentation and drafts

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
