# YouTube for Raycast

Search videos, browse trending and history, and open YouTube in a Safari web app with auto Picture-in-Picture — all from Raycast.

## Features

- **Search Videos** — Live search across YouTube with thumbnails, channel names, durations, and view counts
- **Continue Watching** — Instantly opens the YouTube Safari web app and resumes your last watched video
- **Browse Trending** — Discover trending videos, cached for instant load with background refresh
- **Browse History** — Quick access to your recently watched YouTube videos, cached and searchable
- **Setup YouTube** — One-time setup guide for the Safari web app and AutoPiP extension

## Requirements

- [Raycast](https://raycast.com)
- macOS 13+
- Safari (for web app integration)

## Install

### From the Raycast Store (recommended)

Once published, search "YouTube" in the Raycast Store and click Install.

### From Source

```bash
git clone https://github.com/abhishakenp/youtube-raycast.git
cd youtube-raycast
npm install
npm run build
ray publish
```

The `ray publish` command will install the extension locally and submit it to the Raycast Store.

## First-Time Setup

1. Open the **Setup YouTube** command in Raycast
2. Follow the guide to create a Safari web app for YouTube (Safari → File → Add to Dock)
3. (Optional) Install [AutoPiP](https://apps.apple.com/app/autopip) Safari extension for automatic Picture-in-Picture
4. You're ready — search videos and hit Enter to open in the web app

## How It Works

- Uses `youtube-sr` to search YouTube without an API key
- Search results, trending, and history are cached with `@tanstack/react-query` + Raycast `LocalStorage` for instant load
- Opening videos launches the Safari web app and navigates to the video URL
- **Continue Watching** resumes the last page the web app was on (it remembers its state)

## Tech Stack

- [Raycast API](https://developers.raycast.com)
- React 19 + TypeScript
- [@tanstack/react-query](https://tanstack.com/query) for data fetching and caching
- [youtube-sr](https://www.npmjs.com/package/youtube-sr) for YouTube search without API key
- AppleScript for Safari web app control

## License

MIT
