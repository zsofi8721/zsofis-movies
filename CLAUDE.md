# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
```

There is no test runner configured. No lint CLI script is defined, but ESLint runs automatically via `vite-plugin-eslint` during dev/build.

## Environment Variables

Required in `.env` at project root:
```
VITE_API_KEY=<tmdb-api-key>
VITE_TMDB_API_BASE_URL=https://api.themoviedb.org/3
```

Optional: `VITE_GA_MEASUREMENT_ID`, `VITE_GOOGLE_AD_SLOT`, `VITE_GOOGLE_AD_CLIENT`

All env vars must be prefixed with `VITE_` (Vite requirement). Accessed via `import.meta.env` through `src/utils/config.ts`.

## Architecture

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, RTK Query, Framer Motion, React Router v6

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### Data Fetching

All TMDB API calls go through a single RTK Query API slice in `src/services/TMDB.ts`. It exposes two hooks:
- `useGetShowsQuery` — lists (popular, top rated, search, similar)
- `useGetShowQuery` — single movie/show detail with videos and credits appended

The API is provided via `@reduxjs/toolkit`'s `ApiProvider` (no Redux store — just the API slice).

### State Management

No Redux store. App state is managed through two React Contexts:
- `src/context/globalContext.tsx` — sidebar visibility, video modal state, trailer fetching
- `src/context/themeContext.tsx` — dark/light/system theme with localStorage persistence

Both export a custom hook (`useGlobalContext`, `useTheme`) and a Provider component. Providers are composed in `src/main.tsx`.

### Routing

Routes are defined in `src/App.tsx`. All pages are lazy-loaded with `React.lazy` + `Suspense`:
- `/` — Home (hero slider + content sections)
- `/:category` — Catalog (grid with search, infinite "load more")
- `/:category/:id` — Detail (poster, genres, cast, videos, similar)
- `*` — NotFound

The `/:category` parameter is `"movie"` or `"tv"` and maps directly to TMDB API paths.

### Navigation

Nav links are defined in `src/constants/index.ts` (`navLinks` array). Both the Header and Sidebar components read from this array, so adding a nav link in one place updates both.

### Styling

- Tailwind CSS with class-based dark mode (`darkMode: "class"`)
- Custom breakpoint: `xs: 380px`
- Reusable Tailwind class strings exported from `src/styles/index.ts` (e.g., `maxWidth`, `smallMaxWidth`, `watchBtn`, `mainHeading`)
- `cn()` utility in `src/utils/helper.ts` (clsx + tailwind-merge) for conditional class composition
- Fonts: Nunito, Roboto, Roboto Condensed

### Shared Components

Reusable components live in `src/common/` and are re-exported through `src/common/index.ts`. Key ones: `MovieCard` (poster card used in catalog and sections), `Section` (titled content row with Swiper slides), `Poster`, `Loader`/`SkelatonLoader`.

### Types

Global types are in `src/types.d.ts`. Key interfaces: `IMovie` (poster_path, original_title, name, id), `INavLink`, `ITheme`.

## Development Best Practices

### Testing

- Write tests for each implementation step before moving on to the next. Verify the current milestone works before starting the next one.
- Run `npm run build` after each meaningful change to catch TypeScript errors early — there is no separate test runner, so the build is the primary automated check.
- Manually test both dark and light themes, and at least one mobile-width breakpoint, for any UI change.

### Commits

- Make small, focused commits — one per logical change (e.g., one commit for adding a context, a separate commit for the UI that consumes it).
- Write descriptive commit messages that explain *why*, not just *what* (e.g., "Add WatchlistContext for client-side persistence" rather than "Add new file").
- Run `npm run build` before committing to ensure the project compiles cleanly.

### Follow Existing Patterns

- **New context:** Follow the pattern in `globalContext.tsx` / `themeContext.tsx` — create the context, a Provider component, and a `use<Name>()` hook, all in one file.
- **New pages:** Lazy-load via `React.lazy` in `App.tsx`, place in `src/pages/<PageName>/index.tsx`.
- **New shared components:** Place in `src/common/<ComponentName>/index.tsx` and re-export from `src/common/index.ts`.
- **Styling:** Use Tailwind utility classes. Compose conditional classes with `cn()`. Reuse shared class strings from `src/styles/index.ts` instead of duplicating long class lists.
- **Imports:** Use the `@/` path alias for all imports from `src/`.

### Code Quality

- Keep components focused — split into sub-components under a `components/` subfolder when a page file grows large (see `Detail/components/`, `Catalog/components/`).
- Add new shared types to `src/types.d.ts` rather than defining inline types across multiple files.
- Ensure all new UI respects the existing dark/light theme by using `dark:` Tailwind variants where needed.
- Use the existing responsive breakpoint convention: mobile-first defaults, then `xs:`, `sm:`, `md:`, `lg:`, `xl:`.
