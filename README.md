# Shahriar Arafat

Personal site for Shahriar Arafat. Plain HTML, CSS, and JavaScript. Open `index.html` in a browser, or serve the folder with any static host. It does not need Node, npm, or a build step.

## Run locally

```bash
python3 -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000).

## Edit the page

The words, links, experience, education, skills, and projects are in [`index.html`](index.html). Change that file. Styles are in [`css/styles.css`](css/styles.css). The clock, command palette, theme, Discord card, project dialog, and contact form are in [`js/main.js`](js/main.js).

To add detail to a project, put these attributes on its button. Leave one out and that part of the dialog stays hidden.

- `data-description`
- `data-live`
- `data-github`
- `data-tech` — comma-separated
- `data-features` — separate items with `|`

The resume file is [`Shahriar-Arafat-Resume.pdf`](Shahriar-Arafat-Resume.pdf). Replace that file to update the download.

Do not add a phone number or a birthday anywhere in the site, including the metadata in `index.html`.

## Discord live status

The status card uses [Lanyard](https://github.com/Phineas/lanyard): a WebSocket when it can connect, and the REST API if the socket fails.

1. Join the Lanyard Discord server: [https://discord.gg/UrXF2cfJ7F](https://discord.gg/UrXF2cfJ7F). Presence starts updating after you join.
2. In Discord, turn on Developer Mode (User Settings → Advanced → Developer Mode).
3. Right-click your avatar and choose Copy User ID.
4. Put that id in the `discord-user-id` meta tag in `index.html`:

```html
<meta name="discord-user-id" content="">
```

5. Reload the page.

If that tag is empty, or Lanyard says the account is not monitored, the card shows the Discord username `shahriararafat` and a button that copies it.

## Checks

```bash
node --test js/lanyard.test.js
```
