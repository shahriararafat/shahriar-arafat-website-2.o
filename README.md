# Shahriar Arafat

Personal site for Shahriar Arafat. Next.js App Router, TypeScript, and Tailwind CSS. It is ready to deploy on Vercel’s free tier; this repo does not deploy itself.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Edit content

All copy, links, skills, experience, education, and projects live in [`content/site.ts`](content/site.ts). The page reads that file, so a wording change or a new project does not require a component edit.

Each project needs `title`, `category`, `image`, and `imageAlt`. These fields are optional, and the project dialog only renders the ones you set:

- `description`
- `liveUrl`
- `githubUrl`
- `tech`
- `features`

The resume file is [`public/Shahriar-Arafat-Resume.pdf`](public/Shahriar-Arafat-Resume.pdf). Replace that file to update the download.

Do not add a phone number or a birthday anywhere in the site, including metadata.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_DISCORD_USER_ID` | Discord user ID for the live status card. Leave it empty to show the username fallback. |

Copy [`.env.example`](.env.example) to `.env.local`. `.env.local` stays untracked.

## Discord live status

The status card uses [Lanyard](https://github.com/Phineas/lanyard): a WebSocket when it can connect, and the REST API if the socket fails.

1. Join the Lanyard Discord server: [https://discord.gg/UrXF2cfJ7F](https://discord.gg/UrXF2cfJ7F). Presence starts updating after you join.
2. In Discord, turn on Developer Mode (User Settings → Advanced → Developer Mode).
3. Right-click your avatar and choose Copy User ID.
4. Set `NEXT_PUBLIC_DISCORD_USER_ID` in `.env.local` to that ID.
5. Restart `npm run dev`.

If the variable is unset, or Lanyard says the account is not monitored, the card shows the Discord username `shahriararafat` and a button that copies it. It does not show a broken error state.

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
