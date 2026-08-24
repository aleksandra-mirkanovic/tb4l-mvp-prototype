# TB4L MVP Workflow Prototype

Interactive frontend prototype for the **TB4L Knowledge Hub** and **Contextual Chat**.

**TB4L = Trusted Brands for Life** — Bayer Consumer Health’s brand-building framework supporting the Road to Billions Strategy (Discover · Define · Design · Deliver).

Mocked data only — no backend, auth, or real AI/Genie integrations.

## Run locally

Node.js 18+ required.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173/tb4l-mvp-prototype/`).

```bash
npm run build
npm run preview
```

## GitHub Pages

Repo: `tb4l-mvp-prototype`  
Live: **https://aleksandra-mirkanovic.github.io/tb4l-mvp-prototype/**

Deploy workflow (`.github/workflows/pages.yml`) runs `npm install` + `npm run build` and publishes `dist/`.

`vite.config.ts` sets `base: '/tb4l-mvp-prototype/'` for the project site path.

### Push updates

```bash
git add .
git commit -m "Your message"
git push
```

Actions will rebuild and redeploy.

## Demo tips

- Ask “What is the TB4L framework?” in Chat for the framework definition.
- Genie is never auto-triggered; connect it explicitly before asking.
- Type `fail genie` with Genie enabled to demo the Genie error state.
