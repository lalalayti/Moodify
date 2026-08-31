# ✦ Moodify ✦

> your little corner for thoughts & music 🎧

Moodify is a private mood-journaling web app that recommends Spotify playlists based on your journal entry, selected mood, and music preference.

## ✎ Features

- User signup and login
- Private journal entries
- Create, edit, and delete entries
- Mood selection
- Choose between matching your mood or cheering you up
- AI-powered journal analysis using Gemini
- Spotify playlist recommendations
- Refresh playlist suggestions
- Save a selected playlist to a journal entry

## ♪ Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Gemini API
- Spotify Web API

## ⚙ Setup

Clone the repository and install the dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

GEMINI_API_KEY=

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## ♡ About

Moodify was created as a portfolio project combining journaling, AI-powered mood analysis, and music recommendations in a scrapbook-inspired interface.

---

✦ write it down  
✦ find your mood  
✦ press play
