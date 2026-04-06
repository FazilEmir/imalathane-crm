# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on http://localhost:3000 (auto-opens browser)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

No test, lint, or typecheck scripts are configured.

## Architecture

This is a **single-page React 18 + Vite** CRM/inventory app for a small manufacturing business (cilt şapı, kantaşı, rolon deodorant). The entire application lives in **`src/App.jsx`** (~750 lines) as one default-exported `CRM` component plus inline page/form subcomponents. There is no router, no CSS files, no component library — styling is inline via a `T` theme object and a single injected `css` string. UI language is Turkish.

### Data model (defined at top of `src/App.jsx`)

- `DEF_PRODUCTS` — 4 catalog products (`p1`–`p4`) with default prices
- `DEF_MATERIALS` — raw/packaging/koli stock items (`m1`–`m14`), categorized `hammadde` | `ambalaj` | `koli`
- `DEF_FG` — finished-goods koli SKUs (`fg1`–`fg5`), each linked to a `productId` and a `piecesPerKoli` count
- `RECIPES` — bill-of-materials for each finished good: consumed material IDs and `qtyPerUnit` per koli produced

Orders reduce `finishedGoods` stock (`deductFG`). Production (`ProduceF`) reduces `materials` stock and increases `finishedGoods` stock based on `RECIPES`. Customer-specific prices live in `customer.customPrices[productId]` and are resolved via `getCustPrice`.

### Persistence layer (critical)

State persists through a `window.storage` async API (`get`/`set`/`delete`/`list`) — **not** `localStorage` directly. `src/main.jsx` installs a localStorage-backed shim if `window.storage` is absent, which is how the app runs outside the Claude artifact sandbox. When running inside a Claude artifact, the native `window.storage` is used instead. Any new persistent state must go through `usePersistedState(key, default)` (App.jsx:126), which debounces writes by 300ms and tracks a `loaded` flag; the app shows `<Spinner/>` until all slices report loaded.

Storage keys are namespaced under `crm:` (see `STORAGE_KEYS`). The Settings page can wipe all keys via `resetAll`.

### Page structure

`CRM` holds `page` state and switches between inline page components: `DashP`, `CustP`, `OrderP`, `PayP`, `InvP`, `ProdP`, `SettingsP`. Modals are driven by a single `modal` state (`{type, data}`) opened via `openM(type, data)` and rendered by form components: `CustForm`, `OrderForm`, `PayForm`, `MatForm`, `AddStockF`, `ProduceF`.

Shared micro-components (`Btn`, `IB`, `FF`, `Bdg`, `Spinner`) and the `IC` icon map live above the main component. The `T` object is the single source of truth for colors.

### Conventions to preserve when editing

- Keep everything in `src/App.jsx` unless the user explicitly asks to split files — the app is intentionally single-file.
- Use inline styles with values from `T`; do not introduce CSS modules, Tailwind, or styled-components.
- Any new persisted slice must: add a key to `STORAGE_KEYS`, use `usePersistedState`, and be included in the `allLoaded` gate.
- Stock mutations (orders, production) must go through the existing deduction helpers so finished-goods and material stocks stay consistent with recipes.
- UI strings are Turkish; match existing tone and terminology (Müşteri, Sipariş, Tahsilat, Koli, etc.).
