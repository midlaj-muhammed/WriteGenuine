# ✅ WriteGenuine

A comprehensive text analysis platform for detecting AI-generated content, checking plagiarism, and humanizing AI text.

🌐 **[Live Demo](https://writegenuine.netlify.app/)**


## ✨ Features

- **🔍 Plagiarism Checker**: Compare your content against billions of web pages to identify potential plagiarism
- **🤖 AI Detection**: Analyze text to determine if it was written by AI or a human
- **👤 AI Humanizer**: Transform AI-generated text into natural human writing that bypasses detection

## 🛠️ Technology Stack

- **⚛️ Frontend**: React, TypeScript, Vite
- **🎨 UI Components**: shadcn/ui, Tailwind CSS
- **🧠 AI Integration**: Google Generative AI (Gemini)

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn

### 📥 Installation

1. Clone the repository
```sh
git clone https://github.com/midlaj-muhammed/WriteGenuine.git
cd authenticity-haven
```

2. Install dependencies
```sh
npm install
# or
yarn install
```

3. Start the development server
```sh
npm run dev
# or
yarn dev
```

4. Access the application at `http://localhost:5173`

## 🔑 API Key Configuration

This project uses Google's Generative AI (Gemini) API. An API key is already preconfigured in the application, so you can start using all features immediately without needing to obtain your own API key.

If you want to use your own API key:
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `src/lib/api-key-manager.ts`
3. Replace the value of `DEFAULT_API_KEY` with your own API key

## 📝 Usage

1. Navigate to the dashboard
2. Select the tool you want to use (Plagiarism Checker, AI Detection, or AI Humanizer)
3. Enter or paste your text
4. Click the corresponding action button to analyze or transform your text

## 🏗️ Building for Production

```sh
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed.

## ⚖️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by [Google Generative AI](https://ai.google.dev/)
