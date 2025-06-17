# Hanselminutes Podcast Site

A modern, responsive podcast website built with Next.js that displays episodes from the Hanselminutes RSS feed with an integrated audio player.

## 🎯 Features

### Core Functionality
- ✅ **RSS Feed Integration**: Automatically fetches and parses Hanselminutes podcast episodes
- ✅ **Episode Cards**: Clean, card-based layout displaying episode artwork, titles, and metadata
- ✅ **Audio Player**: Custom HTML5 audio player with keyboard shortcuts and full controls
- ✅ **Episode Details**: Individual episode pages with show notes and metadata
- ✅ **Smart Search**: Debounced search with clear functionality across episode titles and descriptions
- ✅ **Responsive Design**: Mobile-first design that works on all screen sizes

### Enhanced User Experience
- ✅ **Keyboard Shortcuts**: Full keyboard control for audio player (Space, arrows, R, Esc)
- ✅ **Error Boundaries**: Graceful error handling with user-friendly messages
- ✅ **Toast Notifications**: Non-intrusive notifications for user feedback
- ✅ **Loading Skeletons**: Smooth loading states with animated placeholders
- ✅ **Enhanced Search**: 300ms debouncing with clear button and result count

### Technical Features
- ✅ **Server-side Caching**: RSS feed cached for 1 hour to improve performance
- ✅ **Audio Proxy**: CORS-compliant audio streaming with range request support
- ✅ **URL Redirect Handling**: Automatically unwraps tracking URLs from RSS feed
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **SEO Optimized**: Proper meta tags and structured data
- ✅ **Performance Optimized**: Next.js Image optimization and lazy loading
- ✅ **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR for client-side caching
- **RSS Parsing**: fast-xml-parser
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel/Netlify

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd podcast-site
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎵 Audio Player Features

- **Play/Pause**: Click episode cards or use player controls
- **Seek**: Click progress bar to jump to specific timestamps
- **Volume Control**: Adjustable volume slider
- **Speed Control**: 0.5x to 2x playback speed
- **Persistent Player**: Continues playing when navigating between pages
- **Mobile Optimized**: Touch-friendly controls

### ⌨️ Keyboard Shortcuts
When the audio player is open:
- **Space**: Play/Pause
- **← (Left Arrow)**: Skip back 10 seconds
- **→ (Right Arrow)**: Skip forward 10 seconds
- **↑ (Up Arrow)**: Volume up
- **↓ (Down Arrow)**: Volume down
- **R**: Change playback speed
- **Esc**: Close player

*Tip: Click the keyboard icon in the footer to see all shortcuts*

## 📱 Responsive Design

- **Mobile (320px+)**: Single column layout, simplified controls
- **Tablet (768px+)**: Two-column episode grid
- **Desktop (1024px+)**: Multi-column grid with full features
- **Large screens (1280px+)**: Optimized spacing and layout

## ⚡ Performance

- **RSS Caching**: Server-side cache prevents repeated RSS fetches
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Optimization**: Code splitting and tree shaking
- **Audio Streaming**: Progressive loading with range request support

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

Built with ❤️ using Next.js and modern web technologies.
