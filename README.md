# Creator Manage Platform

A creator operations console for managing analytics, brand campaigns, content uploads, and wallet payouts — with **dark/light theme**, **Chinese / English i18n**, and **responsive mobile layout**.

Remote repository: [wenxun2002/CreatorManagePlatform](https://github.com/wenxun2002/CreatorManagePlatform)

---

## Features

### Dashboard
- Short-video / live performance tabs
- Creator profile card with schedule calendar
- Overview metric cards with **expandable 7-day sparklines** (click to expand)
- Dual-axis analytics chart (ECharts) with dataZoom for mobile pan/zoom
- Audience demographics doughnut chart
- List sections (top content, recent posts, opportunities / live equivalents)

### Campaigns
- Filterable campaign cards (pending / in progress / under review / completed)
- Right-side **drawer** (desktop) / **bottom sheet** (mobile) with brief, attachments, and status actions

### Content
- Drag-and-drop video upload zone
- Tabs: Published / Drafts / Scheduled
- Responsive media grid with hover play affordance

### Wallet
- Balance overview with **show/hide amounts** (eye toggle, default hidden)
- Withdrawal modal / mobile bottom sheet (amount validation + method selection)
- Transaction history: **desktop table** + **mobile card list**

### Platform shell
- Desktop sidebar navigation
- Mobile bottom tab bar
- Header: language switch, theme toggle, profile menu, logout
- Mock auth with route guard (`/login`)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Vue 3](https://vuejs.org/) (`<script setup>` + Composition API) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vite.dev/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| Charts | [ECharts](https://echarts.apache.org/) + [vue-echarts](https://github.com/ecomfe/vue-echarts) |
| i18n | [vue-i18n](https://vue-i18n.intlify.dev/) (`zh` / `en`) |
| Theme | [@vueuse/core](https://vueuse.org/) `useDark` |
| Icons | [lucide-vue-next](https://lucide.dev/) |
| Date picker | [@vuepic/vue-datepicker](https://vue3datepicker.com/) (+ `date-fns`) |

Data is currently served from **local mock modules** (`src/mock/*`) with artificial delay — no backend required to run the demo.

---

## Project Structure

```
src/
├── assets/                 # Static assets (empty-state illustration, etc.)
├── components/
│   ├── campaigns/          # Campaign drawer
│   ├── common/             # EmptyState, Skeleton, …
│   ├── content/            # UploadZone, ContentCard
│   ├── dashboard/          # Stats, charts, profile, lists, toolbar
│   ├── layout/             # Sidebar, Header, BottomNav
│   └── wallet/             # BalanceOverview, WithdrawModal, DataTable
├── composables/            # useDashboard, useTheme, useCreatorCalendar
├── constants/              # Shared nav items
├── layouts/                # AppLayout (shell)
├── locales/                # zh.ts / en.ts + i18n bootstrap
├── mock/                   # Fake APIs: dashboard, campaigns, content, wallet, creator
├── router/                 # Routes + auth guard
├── stores/                 # Pinia auth store
├── types/                  # TypeScript models
├── utils/                  # Number / currency formatters
├── views/                  # Page-level views
├── App.vue
├── main.ts
└── style.css               # CSS variables (brand, surfaces, dark mode)
```

### Where to change what

| Goal | Start here |
|------|------------|
| Global colors / dark mode tokens | `src/style.css` |
| Page copy (ZH/EN) | `src/locales/zh.ts`, `src/locales/en.ts` |
| Fake business data | `src/mock/*.ts` |
| Page composition | `src/views/*.vue` |
| UI components | `src/components/**` |
| Routes | `src/router/index.ts` |

---

## Getting Started

### Requirements

- Node.js 20+ (recommended)
- npm (or pnpm / yarn)

### Install & run

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Demo login: open `/login` and sign in — the app auto-logs in during local development for convenience.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`vue-tsc`) + production build |
| `npm run preview` | Preview the production build locally |

---

## Architecture Notes

- **Views assemble, components render** — avoid putting business mock numbers inside `.vue` files.
- **Theme** uses CSS variables on `:root` / `.dark`; components prefer semantic Tailwind tokens (`bg-card`, `text-ink`, `text-brand`, `border-line`, `text-up`, `text-down`).
- **Mobile** (`< md`): sidebar hidden, bottom tab bar shown; drawers/modals become bottom sheets; wallet table switches to card list.
- **Auth** is mock-only (`useAuthStore`); replace with a real API when integrating a backend.

---

## Roadmap Ideas

- Wire real APIs (auth, campaigns, content upload, wallet)
- Re-enable dashboard date-range picker once VueDatePicker integration is settled
- Pagination / infinite scroll for content & transactions
- Unit / component tests

---

## License

Private / coursework project unless otherwise specified by the repository owner.
