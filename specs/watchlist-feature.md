# Watchlist Feature Spec

## 1. Overview

The Watchlist feature lets users save movies and TV shows to a personal list so they can keep track of what they want to watch. The list is stored in the browser using `localStorage` — no backend, no user accounts required.

**Why it matters:** Users browse many titles but have no way to remember which ones caught their eye. A watchlist turns passive browsing into active intent, increasing engagement and return visits.

---

## 2. User Stories

| # | As a user, I want to... | So that... |
|---|------------------------|------------|
| 1 | Tap "Add to Watchlist" on a movie/TV show detail page | I can save it for later |
| 2 | See a visual indicator when an item is already on my watchlist | I know I've saved it and can remove it |
| 3 | View all my watchlisted items on a dedicated page | I can browse everything I've saved in one place |
| 4 | Remove an item from my watchlist | I can clean up titles I'm no longer interested in |
| 5 | Navigate to the Watchlist page from the main nav | I can access my list from anywhere in the app |
| 6 | Have my watchlist persist across page reloads | I don't lose my saved items when I close the browser |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| F1 | A "Add to Watchlist" button is displayed on every Detail page (`/:category/:id`) |
| F2 | Clicking the button adds the current movie/show to the watchlist |
| F3 | If the item is already on the watchlist, the button changes to "Remove from Watchlist" (toggle behavior) |
| F4 | The watchlist is persisted in `localStorage` under a dedicated key (`watchlist`) |
| F5 | A new `/watchlist` route displays all saved items using the existing `MovieCard` component |
| F6 | The Watchlist page shows an empty state message when there are no saved items |
| F7 | A "Watchlist" link appears in the navigation bar (header + sidebar) |
| F8 | Items can be removed from the Watchlist page via a remove button on each card |

### 3.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| N1 | The watchlist page loads lazily, consistent with existing pages |
| N2 | The feature works without any network requests (fully client-side) |
| N3 | The `localStorage` payload stays small — only store the minimum fields needed to render a card and link to the detail page |
| N4 | The feature supports both light and dark themes using existing theme infrastructure |

---

## 4. Design Approach

### 4.1 "Add to Watchlist" Button (Detail Page)

**Placement:** Below the genre tags, above the cast section — inside the existing `m.div` content column on the Detail page.

**States:**

| State | Label | Style |
|-------|-------|-------|
| Not in watchlist | "+ Add to Watchlist" | Outlined button (border, transparent background) matching the existing `watchBtn` style in `src/styles/index.ts` |
| In watchlist | "Remove from Watchlist" | Filled/solid button (e.g. red background) to clearly indicate the item is saved |

**Interaction:** Single click toggles between add/remove. No confirmation dialog needed for removal from the detail page.

### 4.2 Watchlist Page (`/watchlist`)

**Layout:** Mirrors the Catalog page layout — a grid of `MovieCard` components, wrapped in the `smallMaxWidth` container.

**Header:** A simple heading: "My Watchlist" with item count (e.g. "My Watchlist (3)").

**Empty state:** Centered message: "Your watchlist is empty." with a link back to the home page.

**Remove action:** Each card has a small "X" / remove button (top-right corner) that removes the item from the watchlist. A brief visual transition (e.g. fade out) provides feedback.

### 4.3 Navigation

A new entry in the `navLinks` array in `src/constants/index.ts`:

```
{ title: "watchlist", path: "/watchlist", icon: <bookmark-icon> }
```

This automatically populates both the Header nav and the Sidebar nav since they both read from `navLinks`.

---

## 5. Technical Approach

### 5.1 Architecture Summary

The feature touches four areas of the codebase:

```
src/
  context/
    watchlistContext.tsx      <-- NEW: React Context + localStorage logic
  pages/
    Watchlist/
      index.tsx               <-- NEW: Watchlist page component
  pages/
    Detail/
      index.tsx               <-- MODIFIED: Add watchlist button
  constants/
    index.ts                  <-- MODIFIED: Add nav link
  App.tsx                     <-- MODIFIED: Add /watchlist route
  main.tsx                    <-- MODIFIED: Wrap app in WatchlistProvider
  types.d.ts                  <-- MODIFIED: Add IWatchlistItem type
```

### 5.2 Data Model

Store the minimum data needed to render a `MovieCard` and link back to the detail page:

```ts
interface IWatchlistItem {
  id: string;
  category: "movie" | "tv";     // needed for routing (/:category/:id)
  poster_path: string;
  original_title: string;
  name: string;
}
```

**localStorage key:** `"watchlist"`
**localStorage value:** JSON-stringified array of `IWatchlistItem` objects

This matches the shape of `IMovie` (defined in `src/types.d.ts`) so items can be passed directly to `MovieCard` without transformation.

### 5.3 WatchlistContext (`src/context/watchlistContext.tsx`)

Follows the existing context pattern used by `globalContext.tsx` and `themeContext.tsx`:

```ts
// Context shape
{
  watchlist: IWatchlistItem[];
  addToWatchlist: (item: IWatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}
```

**Implementation details:**
- Initialize state by reading from `localStorage` on mount (same pattern as `getTheme()` in `src/utils/helper.ts`)
- On every state change, sync the updated array back to `localStorage`
- Export a `useWatchlist()` hook (mirrors `useTheme()` and `useGlobalContext()`)

### 5.4 Provider Setup (`src/main.tsx`)

Wrap the app in `WatchlistProvider`, added inside the existing provider chain:

```
<ThemeProvider>
  <GlobalContextProvider>
    <WatchlistProvider>        <-- NEW
      <LazyMotion features={domAnimation}>
        <App />
      </LazyMotion>
    </WatchlistProvider>
  </GlobalContextProvider>
</ThemeProvider>
```

### 5.5 Route (`src/App.tsx`)

Add a lazy-loaded route, consistent with existing pages:

```ts
const Watchlist = lazy(() => import("./pages/Watchlist"));

// Inside <Routes>:
<Route path="/watchlist" element={<Watchlist />} />
```

**Important:** Place this route before the `/:category/:id` and `/:category` catch-all routes so it doesn't get matched as a category.

### 5.6 Nav Link (`src/constants/index.ts`)

Add to the `navLinks` array:

```ts
import { BsBookmark } from "react-icons/bs";

{
  title: "watchlist",
  path: "/watchlist",
  icon: BsBookmark,
}
```

`react-icons/bs` (Bootstrap icons) is already installed as a dependency (used for `BsMoonStarsFill` in the same file).

### 5.7 Detail Page Button (`src/pages/Detail/index.tsx`)

Add a watchlist toggle button inside the existing motion-animated content column, after the genre list and before the overview paragraph:

```tsx
const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

const inWatchlist = isInWatchlist(String(id));

const handleWatchlistToggle = () => {
  if (inWatchlist) {
    removeFromWatchlist(String(id));
  } else {
    addToWatchlist({
      id: String(id),
      category: category as "movie" | "tv",
      poster_path: posterPath,
      original_title: title,
      name,
    });
  }
};
```

The button uses the existing `watchBtn` style class from `src/styles/index.ts`.

### 5.8 Watchlist Page (`src/pages/Watchlist/index.tsx`)

- Reads items from `useWatchlist()` context
- Renders each item using the existing `MovieCard` component (passing `item` as `movie` and `item.category` as `category`)
- Wraps each card in a container with a remove button
- Uses `smallMaxWidth` for layout consistency with the Catalog page
- Shows an empty state when the list is empty

---

## 6. Implementation Milestones

### Milestone 1: Context + Storage Layer

**What:** Create `WatchlistContext` with add, remove, toggle, and persistence logic.

**Files:**
- Create `src/context/watchlistContext.tsx`
- Update `src/types.d.ts` (add `IWatchlistItem`)
- Update `src/main.tsx` (wrap in `WatchlistProvider`)

**Done when:** You can call `useWatchlist()` from any component and `addToWatchlist` / `removeFromWatchlist` persist across page reloads.

---

### Milestone 2: Detail Page — Add/Remove Button

**What:** Add the watchlist toggle button to the Detail page.

**Files:**
- Update `src/pages/Detail/index.tsx`

**Done when:** Visiting a movie/show detail page shows "Add to Watchlist" or "Remove from Watchlist" depending on current state. Clicking toggles the state and persists it.

---

### Milestone 3: Watchlist Page + Route

**What:** Create the Watchlist page and wire up the route.

**Files:**
- Create `src/pages/Watchlist/index.tsx`
- Update `src/App.tsx` (add lazy import + route)

**Done when:** Navigating to `/watchlist` shows all saved items as cards. Clicking a card navigates to its detail page. Each card has a remove button.

---

### Milestone 4: Navigation Link

**What:** Add "Watchlist" to the nav bar.

**Files:**
- Update `src/constants/index.ts` (add to `navLinks`)

**Done when:** The header and sidebar both show a "Watchlist" link that navigates to `/watchlist` and highlights when active.

---

## 7. How to Test

### Milestone 1 — Context + Storage

1. Open the app in the browser
2. Open browser DevTools > Application > Local Storage
3. Confirm there is no `watchlist` key yet
4. (Dev testing only) Temporarily call `addToWatchlist()` from a component or the console
5. Verify the `watchlist` key appears in localStorage with the correct JSON
6. Refresh the page — verify the data is still there

### Milestone 2 — Detail Page Button

1. Navigate to any movie detail page (e.g. `/movie/123`)
2. Verify the "Add to Watchlist" button is visible
3. Click it — verify it changes to "Remove from Watchlist"
4. Refresh the page — verify the button still shows "Remove from Watchlist"
5. Click again — verify it reverts to "Add to Watchlist"
6. Check localStorage — verify the item was removed

### Milestone 3 — Watchlist Page

1. Add 2-3 items from different detail pages
2. Navigate to `/watchlist` by typing the URL
3. Verify all added items appear as cards
4. Click a card — verify it navigates to the correct detail page
5. Click the remove button on a card — verify it disappears
6. Remove all items — verify the empty state message appears
7. Refresh — verify the list matches what's in localStorage

### Milestone 4 — Navigation

1. Look at the header nav — verify "Watchlist" link is present
2. Click it — verify it navigates to `/watchlist`
3. Verify the link is highlighted/active when on the watchlist page
4. Open the mobile sidebar — verify "Watchlist" appears there too
5. Test on a narrow viewport — verify the sidebar link works

### Cross-Cutting Tests

- **Theme:** Switch between dark and light mode on the Watchlist page — verify all elements render correctly in both
- **Persistence:** Add items, close the browser tab entirely, reopen — verify the watchlist is intact
- **Edge cases:** Try adding the same item twice (should not duplicate). Try removing an item that's already gone (should be a no-op)
