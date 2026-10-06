# Creator Manage Platform / 创作者管理平台

[![Vue 3](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20TypeScript-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Laravel](https://img.shields.io/badge/Backend-Laravel%2013%20%2B%20Sanctum-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#license--许可)

> **EN** — An enterprise-oriented creator operations console: analytics, brand campaigns, content, and wallet — built as a **decoupled SPA + API** with **RBAC**, a **campaign status state machine**, and **SSOT-governed dashboard metrics**.
>
> **中文** — 面向企业场景的创作者运营控制台：数据看板、品牌合作、内容与钱包。采用 **前后端分离**，具备 **双角色 RBAC**、**合作状态机**，以及 Dashboard 的 **单一事实来源（SSOT）数据治理**。

**Repository / 仓库:** [wenxun2002/CreatorManagePlatform](https://github.com/wenxun2002/CreatorManagePlatform)

---

## Table of Contents / 目录

1. [Architecture Overview / 架构总览](#1-architecture-overview--架构总览)
2. [SSOT Data Governance / 单一事实来源治理](#2-ssot-data-governance--单一事实来源治理)
3. [RBAC Dual-Role Access / 双角色权限模型](#3-rbac-dual-role-access--双角色权限模型)
4. [Campaign Status State Machine / 合作状态机](#4-campaign-status-state-machine--合作状态机)
5. [Feature Map / 功能地图](#5-feature-map--功能地图)
6. [Tech Stack / 技术栈](#6-tech-stack--技术栈)
7. [Project Structure / 项目结构](#7-project-structure--项目结构)
8. [Getting Started / 快速开始](#8-getting-started--快速开始)
9. [API Surface / API 概览](#9-api-surface--api-概览)
10. [Roadmap / 路线图](#10-roadmap--路线图)
11. [License / 许可](#11-license--许可)

---

## 1. Architecture Overview / 架构总览

### English

The platform is a **frontend–backend separated** system:

| Layer | Responsibility |
|-------|----------------|
| **Vue 3 SPA** | Presentation, routing, i18n, theme, client-side RBAC UI gating |
| **Laravel API** | Auth (Sanctum bearer tokens), domain rules, persistence, file storage |
| **PostgreSQL** | Users, campaigns, tokens, jobs/cache/session tables |

```
┌─────────────────────────────┐         Bearer Token (Sanctum)
│  Vue 3 + Pinia + Vite SPA   │ ──────────────────────────────────┐
│  · Route guards (role)      │                                   │
│  · Axios + DTO mapping      │                                   ▼
│  · Dashboard mock (SSOT)    │         ┌─────────────────────────────────┐
│  · Campaigns → live API     │         │  Laravel 13 REST API            │
└─────────────────────────────┘         │  · Auth / Creators / Campaigns  │
                                        │  · Role checks + status rules   │
                                        │  · Public disk (attachments)    │
                                        └──────────────────┬──────────────┘
                                                           │
                                                           ▼
                                                 ┌──────────────────┐
                                                 │   PostgreSQL     │
                                                 └──────────────────┘
```

**Anti-corruption at the boundary:** Laravel returns `snake_case` JSON (`ApiCampaign`); the SPA maps to a camelCase domain model (`Campaign`) in `src/api/campaigns.ts`. Views never bind to raw API shapes.

**Hybrid data strategy (intentional):**

| Domain | Source | Why |
|--------|--------|-----|
| Auth + Campaigns | Real Laravel API | Full-stack closed loop for RBAC & state machine |
| Dashboard / Content / Wallet | Local mock modules | Showcase large-scale (M/K) visuals without seed noise |

### 中文

本平台采用 **前后端分离**：

| 层级 | 职责 |
|------|------|
| **Vue 3 SPA** | 展示、路由、国际化、主题、前端 RBAC 界面门禁 |
| **Laravel API** | 鉴权（Sanctum Token）、领域规则、持久化、文件存储 |
| **PostgreSQL** | 用户、合作、令牌及任务/缓存/会话表 |

**边界防腐：** 后端输出 `snake_case`（`ApiCampaign`），前端在 `src/api/campaigns.ts` 映射为驼峰领域模型（`Campaign`），页面不直接依赖原始 API 结构。

**混合数据策略（刻意设计）：** Auth / Campaigns 走真实 API；Dashboard / Content / Wallet 使用 Mock，便于展示大基数可视化，同时保证合作链路可演示、可联调。

---

## 2. SSOT Data Governance / 单一事实来源治理

### English — Dashboard Single Source of Truth

Dashboard metrics are **not** independent hardcoded numbers. They follow a strict derivation pipeline in `src/mock/dashboard.ts`:

```
Catalog (videos / live sessions)
    │  · Engagement rate clamped to 4%–9%
    ▼
Extended daily series
    │  · Catalog long-tail floor (idle days ≠ absolute zero)
    │  · Release day + weighted long-tail spikes
    ▼
Slice: previous window  |  current window
    │
    ├─► Overview cards     = reduce(current series)
    ├─► Main dual chart    = current series
    ├─► Sparkline          = current series path
    └─► WoW trend %        = (current total − previous total) / previous
```

**Governance rules:**

1. **One pipeline, many consumers** — cards, charts, and sparklines must not invent separate totals.
2. **No absolute-zero cliffs** — idle days keep a soft long-tail floor (≈5–8k views / $50–80 revenue) so curves stay commercially believable.
3. **Auth identity ≠ KPI showcase** — `useAuthStore` merges real login name/id with durable mock social KPIs (`MOCK_CREATOR_PROFILE`), so ProfileCard stays rich after Sanctum login.
4. **UI components render only** — Vue components consume `DashboardData`; they do not fabricate business figures.

### 中文 — Dashboard 单一事实来源

看板指标禁止各自写死。`src/mock/dashboard.ts` 强制统一推导：

1. **目录 → 日序列 → 切片聚合**：卡片合计 = 当前窗口日序列 `reduce`；主图 = 当前窗口；迷你趋势图 = **当前周期**走势；环比 = 当前窗口 vs 上一同长窗口。
2. **禁止绝对零度断崖**：无新内容的日子保留长尾底噪，曲线自然起伏。
3. **鉴权身份与展示 KPI 分离**：真实登录只提供身份；粉丝/点赞等展示 KPI 与 Mock 合并，避免登录后 Profile「被清零」。
4. **组件只渲染**：业务数字只来自 `fetchDashboardData()` 的 `DashboardData`。

---

## 3. RBAC Dual-Role Access / 双角色权限模型

### English

Two roles: **`creator`** and **`manager`**. Enforcement is layered:

| Layer | Mechanism |
|-------|-----------|
| **Route** | `router.beforeEach` + `meta.roles` — unauthorized roles redirect to role home |
| **Navigation** | `navItemsForRole()` filters sidebar / bottom tabs |
| **API** | Sanctum `auth:sanctum`; manager-only create; participant-only status updates |
| **Query scope** | Managers list campaigns they dispatched; creators see campaigns assigned to them |

| Capability | Creator | Manager |
|------------|:-------:|:-------:|
| Dashboard / Content / Wallet | ✅ | ❌ |
| Campaigns list & drawer | ✅ | ✅ |
| Create / dispatch campaign | ❌ | ✅ |
| Accept campaign (`→ in_progress`) | ✅ | ❌ |
| Submit deliverable (`→ under_review`) | ✅ | ❌ |
| Approve campaign (`→ completed`) | ❌ | ✅ |
| Default landing | `/dashboard` | `/campaigns` |

### 中文

双角色：**创作者 `creator`**、**经理 `manager`**。权限多层兜底：

| 层级 | 机制 |
|------|------|
| **路由** | `meta.roles` + 全局守卫，越权回角色默认页 |
| **导航** | `navItemsForRole()` 过滤侧栏 / 底栏 |
| **API** | Sanctum 鉴权；仅经理可创建；仅参与方可改状态 |
| **数据范围** | 经理看自己下发的合作；创作者看指派给自己的合作 |

默认落地：创作者 → `/dashboard`；经理 → `/campaigns`。

---

## 4. Campaign Status State Machine / 合作状态机

### English

Campaign lifecycle is a **role-gated finite state machine**:

```
                 Manager creates
                      │
                      ▼
                 ┌─────────┐
                 │ pending │
                 └────┬────┘
                      │  Creator accepts
                      ▼
             ┌──────────────┐
             │ in_progress  │
             └──────┬───────┘
                    │  Creator submits video + description
                    ▼
             ┌──────────────┐
             │ under_review │
             └──────┬───────┘
                    │  Manager approves
                    ▼
             ┌────────────┐
             │ completed  │
             └────────────┘
```

| Transition | Actor | Guards / side effects |
|------------|-------|------------------------|
| *(create)* → `pending` | Manager | Multipart attachments optional; one DB row per selected creator |
| `pending` → `in_progress` | Assigned creator | Only the campaign’s `creator_id` |
| `in_progress` → `under_review` | Assigned creator | Requires `submission_file` + `submission_desc` |
| `under_review` → `completed` | Owning manager | Only the campaign’s `manager_id` |

Status is stored as a DB `enum` and mirrored in TypeScript as `CampaignStatus`. UI action buttons are role- and status-aware (card + drawer).

### 中文

合作状态为 **角色门禁的有限状态机**：

| 流转 | 操作者 | 约束 / 副作用 |
|------|--------|----------------|
| 创建 → `pending` | 经理 | 可带附件；按创作者拆行落库 |
| `pending` → `in_progress` | 被指派创作者 | 仅本人可接单 |
| `in_progress` → `under_review` | 被指派创作者 | 必须上传成片 + 提交说明 |
| `under_review` → `completed` | 所属经理 | 仅经理可终审通过 |

前后端共用同一状态枚举；界面按钮按角色 × 状态显隐，与 API 规则对齐。

---

## 5. Feature Map / 功能地图

| Module | EN | 中文 |
|--------|----|------|
| **Dashboard** | Short-video / live tabs, profile + calendar, sparkline cards, dual-axis ECharts, demographics | 短视频/直播切换、资料与日程、可展开迷你图、双轴图表、受众画像 |
| **Campaigns** | Filterable cards, create modal (manager), drawer / mobile sheet, status actions + upload | 筛选卡片、经理创建、抽屉/底栏、状态流转与成片上传 |
| **Content** | Upload zone, published / drafts / scheduled grid (mock) | 上传区、已发布/草稿/排期（Mock） |
| **Wallet** | Balance privacy toggle, withdraw sheet, transaction table/cards (mock) | 金额显隐、提现、流水表/卡片（Mock） |
| **Shell** | Sidebar + bottom nav, ZH/EN, dark/light, logout | 侧栏/底栏、中英、深浅色、退出登录 |

---

## 6. Tech Stack / 技术栈

| Layer | Stack |
|-------|--------|
| Frontend | Vue 3 (`<script setup>`), TypeScript, Vite, Vue Router, Pinia |
| UI | Tailwind CSS v4, lucide-vue-next, vue-i18n (`zh` / `en`), `@vueuse/core` theme |
| Charts | ECharts + vue-echarts |
| HTTP | Axios (`src/utils/request.ts`) — bearer attach, 401 → clear session |
| Backend | PHP 8.3+, Laravel 13, Laravel Sanctum |
| Database | PostgreSQL (configurable; local SQLite possible) |
| Storage | Laravel `public` disk — attachments & submissions |

---

## 7. Project Structure / 项目结构

```
CreatorPlatform/
├── src/                          # Vue SPA
│   ├── api/                      # Live API clients + DTO mappers
│   ├── components/               # Feature UI
│   ├── composables/              # useDashboard, useTheme, …
│   ├── constants/                # RBAC-aware navigation
│   ├── mock/                     # SSOT dashboard + content/wallet mocks
│   ├── router/                   # Routes + auth / role guards
│   ├── stores/                   # Pinia (auth + profile merge)
│   ├── types/                    # Domain + API types
│   ├── utils/                    # request, formatters
│   └── views/
├── creator-backend/              # Laravel API
│   ├── app/Http/Controllers/Api/ # Auth, Campaign, Creator
│   ├── app/Models/               # User, Campaign
│   ├── database/migrations/      # users, campaigns, tokens, …
│   ├── database/seeders/         # DemoUsersSeeder
│   └── routes/api.php
└── README.md
```

---

## 8. Getting Started / 快速开始

### Prerequisites / 环境要求

- **Node.js** 20+
- **PHP** 8.3+ & **Composer**
- **PostgreSQL** (or adjust `DB_*` in `.env`)

### Backend / 后端

```bash
cd creator-backend
composer install
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate

# Configure DB_* then:
php artisan migrate
php artisan db:seed --class=DemoUsersSeeder
php artisan storage:link
php artisan serve             # http://localhost:8000
```

### Frontend / 前端

```bash
# repo root
npm install

# optional: point SPA at API
# .env.development → VITE_API_BASE_URL=http://localhost:8000

npm run dev                   # http://localhost:5173
```

### Demo Accounts / 演示账号

| Role | Email | Password |
|------|-------|----------|
| Manager | `manager@example.com` | `password` |
| Creator | `creator@example.com` | `password` |
| Creator | `creator1@example.com` … `creator3@example.com` | `password` |

### Scripts / 脚本

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `vue-tsc` + production build |
| `npm run preview` | Preview production build |
| `php artisan serve` | Laravel API (from `creator-backend/`) |

---

## 9. API Surface / API 概览

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/api/login` | Public | Returns Sanctum token + user |
| `GET` | `/api/user` | Bearer | Current user |
| `POST` | `/api/logout` | Bearer | Revoke token |
| `GET` | `/api/creators` | Bearer | Creator directory (for dispatch) |
| `GET` | `/api/campaigns` | Bearer | Role-scoped list |
| `POST` | `/api/campaigns` | Bearer | Manager create (multipart) |
| `POST`/`PATCH` | `/api/campaigns/{id}/status` | Bearer | State transitions (`POST` for file submit) |

---

## 10. Roadmap / 路线图

- [ ] Promote Dashboard / Content / Wallet from mock to API with the same SSOT contract
- [ ] Formalize campaign transition matrix (reject / revise loops)
- [ ] Shared `ApiResponse<T>` + validation error DTOs on the SPA
- [ ] Dashboard structural skeletons + request sequencing (abort / generation id)
- [ ] Pagination for campaigns, content, and wallet ledgers
- [ ] Automated API & component tests

---

## 11. License / 许可

Private / coursework project unless otherwise specified by the repository owner.

私有 / 课程项目，除非仓库所有者另行声明许可协议。

---

**Built for creator operations teams who need clear separation of concerns: identity & permissions on the API, believable analytics on a governed SSOT, and a campaign lifecycle that cannot skip role gates.**

**为创作者运营团队而建：鉴权与权限收敛在 API，分析指标受 SSOT 约束，合作流转不可绕过角色门禁。**
