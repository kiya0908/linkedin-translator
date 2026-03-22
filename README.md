# LinkedIn Translator – Translate Profiles, Posts & Messages Instantly

LinkedIn Translator is not just a language translator. It is an AI-powered **Tone Translator** built for workplace communication.

It transforms casual wording into polished, engaging, professional LinkedIn-style copy for posts, profile summaries, and resume descriptions.

[English](README.md) | [中文](README.zh-CN.md) | [Live Site](https://linkedintranslator.online)

- Website: `https://linkedintranslator.online`
- Support: `support@linkedintranslator.online`

## Positioning

LinkedIn Translator is a leading **AI-powered LinkedIn speak translator**.
Unlike traditional translation tools, this professional **English to LinkedIn translator** focuses on turning everyday descriptions into high-quality **professional LinkedIn posts**.

## Why It Is Different

- It is a **tone conversion** product, not a literal translation engine.
- It understands workplace and recruiting context better than general tools such as Google Translate or Kagi Translate.
- It automatically adds LinkedIn-native structure:
  - hooks
  - strategic line breaks
  - professional emojis

## Core Features

- **Human to LinkedIn Speak**: Convert plain text into credible executive-style phrasing.
- **LinkedIn Speak to Plain English**: Decode corporate jargon into clear and simple wording.
- **AI Tone Control**: Keep original intent while upgrading voice, authority, and clarity.
- **Fast Workflow**: Input, transform, and copy in seconds.

## Tech Stack

- [React](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account

### 1. Install

```bash
pnpm install
```

### 2. Configure Environment

Set required variables in Cloudflare (or local `.dev.vars`) such as:

- `KIEAI_APIKEY`
- `SESSION_SECRET`
- `DOMAIN` (recommended: `https://linkedintranslator.online`)
- `CDN_URL` (if used)

### 3. Run Locally

```bash
pnpm run dev
```

Open `http://localhost:5173`.

### 4. Build and Deploy

```bash
pnpm run build
pnpm run deploy
```

## License

MIT. See [LICENSE](LICENSE).
