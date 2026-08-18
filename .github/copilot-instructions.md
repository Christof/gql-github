# Copilot Instructions

## Project Overview

**gql-github** is a React + TypeScript web app for analyzing GitHub contribution statistics and managing release notes, using the GitHub GraphQL API via Apollo Client. It is deployed at https://angry-cray-cc5817.netlify.app/.

A separate Express.js OAuth server (`server/server.js`) handles GitHub token exchange and must be run independently.

## Commands

```bash
# Development
yarn start                  # Dev server on port 3000 (with webpack-dashboard)
yarn run start-dev-server   # Dev server without dashboard

# Build
yarn run build              # Production build to dist/
yarn run build-dashboard    # Production build with dashboard UI

# Test
yarn test                          # Run all tests
yarn test -- __tests__/github_test.ts   # Run a single test file
yarn test -- --watch               # Watch mode
yarn test -- --coverage            # With coverage

# TypeScript
yarn run tsc-watch          # TypeScript compiler in watch mode
```

No lint script is defined. `tslint` is a devDependency but not wired to an npm script.

## Architecture

### Data flow
```
Browser → GraphQLFacade (src/graphql_facade.ts)
             └─ Apollo Client → GitHub GraphQL API (primary)
             └─ REST API via fetch → GitHub REST API (fallback for some endpoints)
```

Authentication: the frontend redirects to GitHub OAuth, then the OAuth server at `server/server.js` exchanges the code for a token. The token is stored and passed as a `Bearer` header on all API calls.

### Key source files

| File | Role |
|---|---|
| `src/components/app.tsx` | Root component — Apollo Client setup, auth context, React Router |
| `src/github.ts` | Main GitHub API class (~400 lines); GraphQL queries + REST fallbacks |
| `src/graphql_facade.ts` | Apollo wrapper with automatic retry logic |
| `src/github_types.ts` | TypeScript interfaces for all GitHub data shapes |
| `src/github_helper.ts` | Transformations (e.g., filter merge commits) |
| `src/stats_helper.ts` | Statistics calculations (weekly commits, cumulative stats) |
| `src/array_helper.ts` | Generic array utilities (flatten, unique, runningAverage) |
| `src/utils.ts` | `windowFetch` wrapper, `delay`, date utilities |
| `server/server.js` | Express OAuth server — requires `--client-id`, `--client-secret`, `--port`, `--host`, `--origin` args |

### Routes (lazy-loaded)
Stats, PersonalStats, OrgStats, Rebaser, ReleaseNotesCreator, ReleaseNotesRetriever, ChangelogCreator

## Key Conventions

### TypeScript
- `strict: true` **except** `strictNullChecks: false`
- `noUnusedLocals` and `noUnusedParameters` are enabled — unused vars are compile errors
- Target: ES2018, module: ESNext, JSX: React (not automatic transform)
- All source is in `src/`; compiled output goes to `dist/`

### Prettier (`.prettierrc`)
```json
{ "singleQuote": false, "arrowParens": "avoid", "trailingComma": "none" }
```
Double quotes, no trailing commas, parens omitted for single-arg arrow functions.

### GraphQL
- Queries are written as **inline template strings** passed to `graphql_facade.ts`, not `.graphql` files
- `GraphQLFacade.query()` wraps Apollo and auto-retries on error with configurable count/delay
- Apollo cache is persisted to `localStorage`

### GitHub class pattern
- `Github` instances can be scoped: `github.copyFor(owner)` returns a new instance for a different owner
- Methods generally return Promises; REST fallback paths live alongside GraphQL paths in the same method

### Testing
- Framework: Jest + ts-jest + Enzyme (React 16 adapter)
- Test files: `__tests__/**/*_test.(ts|tsx|js)`
- Test setup: `config/shim.js` (polyfills) + `config/preprocessor_test.js` (Enzyme adapter)
- `jest-localstorage-mock` is loaded automatically — no manual setup needed in tests
- `testEnvironment` is `jest-environment-jsdom-global`; `testURL` is `http://test.com/unknown`

### OAuth server
Run separately before starting the dev server:
```bash
node server/server.js --port=7000 --host=localhost \
  --client-id=<id> --client-secret=<secret> \
  --origin="http://localhost:3000"
```
