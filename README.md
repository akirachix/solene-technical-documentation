# Solene Technical Documentation

Technical documentation for **Canopy**, the Solene gorilla health monitoring platform. It covers the field app used by gorilla trackers, the web portal used by gorilla doctors and administrators, the API that connects them, and the AI risk module.

The site is built with [VitePress](https://vitepress.dev).

## Contents

| Page                | What it covers                                                |
| ------------------- | ------------------------------------------------------------- |
| Overview            | What Canopy is, who it is for, and its scope                  |
| Architecture        | How the components fit together and how data flows            |
| Backend / API       | The FastAPI service, data model, endpoints and business rules |
| Mobile App          | The Flutter field app, including offline sync                 |
| Web App             | The Next.js portal for vets and administrators                |
| Security            | Authentication, roles and data protection                     |
| AI Module           | Risk predictions and the Canopy assistant                     |
| Deployment          | Hosting, environments and releases                            |
| Design & Guidelines | Colours, components, accessibility and writing rules          |
| Developer Guide     | Setting up and running Canopy locally                         |
| Documentation Guide | How these docs are organised and written                      |

## Getting started

### Prerequisites

- Node.js 18 or newer (`node -v` to check)
- npm

### Install and run

```bash
git clone https://github.com/akirachix/solene-technical-documentation.git
cd solene-technical-documentation
npm install
npm run docs:dev
```

Open http://localhost:5173. The page reloads each time you save a file.

### Commands

| Command                | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run docs:dev`     | Starts the local preview                           |
| `npm run docs:build`   | Builds the static site into `docs/.vitepress/dist` |
| `npm run docs:preview` | Serves the built site for a final check            |

## Project structure

```
solene-technical-documentation/
├── package.json
└── docs/
    ├── .vitepress/
    │   ├── config.ts        # Site title, top menu, sidebar, search
    │   └── theme/
    │       ├── index.ts     # Loads the default theme and custom styles
    │       └── style.css    # Canopy colours and fonts
    ├── public/              # Logo, favicon and images (served from /)
    ├── index.md             # Home page
    └── *.md                 # One file per page
```

Each Markdown file in `docs/` becomes a page: `docs/security.md` is served at `/security`.

## Writing documentation

### Edit a page

1. Open the page in `docs/`, for example `docs/overview.md`.
2. Write under the `# Title`, using `##` for sections and `###` for sub-sections.
3. Check it in the browser with `npm run docs:dev`.

### Add a page

1. Create `docs/your-page.md` with this header:

   ```md
   ---
   title: Your Page
   description: One sentence describing the page.
   status: planned
   ---

   # Your Page
   ```

2. Add it to the sidebar in `docs/.vitepress/config.ts`:

   ```ts
   { text: 'Your Page', link: '/your-page' },
   ```

### Page status

Set `status` in each page's header so the team can see progress:

| Status     | Meaning                       |
| ---------- | ----------------------------- |
| `planned`  | Title only, not started       |
| `draft`    | Being written                 |
| `review`   | Ready for a teammate to check |
| `complete` | Reviewed and up to date       |

### Writing rules

- Describe what the code does today, not what is planned.
- Number sections (`## 1.`, `### 1.1`) so they are easy to refer to.
- Use a table when comparing more than three things.
- Name source files in backticks, such as `services/health_case_service.py`, so readers can find the code.
- List environment variable names only. Never commit secrets or real values.
- Use the product's words: tracker, gorilla doctor, observation, case, follow-up.
- Put images in `docs/public/` and reference them as `/image-name.png`.
- Write each fact in one place and link to it from other pages.

## Contributing

1. Create a branch: `git checkout -b docs/<page-name>`
2. Write or update the page.
3. Run `npm run docs:build` to make sure the site builds. It fails on broken links.
4. Commit, push and open a pull request for review.

## Related repositories

| Repository        | Description                             |
| ----------------- | --------------------------------------- |
| `solene-backend`  | FastAPI service, database and AI module |
| `solene-frontend` | Next.js web portal                      |
| Mobile app        | Flutter field app for trackers          |
