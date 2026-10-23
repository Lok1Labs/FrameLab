# Contributing

Small, focused pull requests are easiest to review. For larger changes, open an issue first to agree on scope.

## Get started

1. Fork the repository and follow the [local setup](./README.md#run-locally), using your fork's clone URL.
2. Branch from the latest `main`: `git switch -c fix/short-description` or `feat/short-description`.
3. Make the change, verify it, and open a pull request against `main`.

Keep secrets in your local `.env`; never commit them. The placeholder database URL in the setup is enough for browser-only development. Use real service credentials only when testing those integrations.

## Where to look

| Area | Location |
|---|---|
| Pages and API routes | `app/` — editor at `/editor`, tools at `/tools` |
| Editor controls and canvas | `components/editor/`, `components/canvas/` |
| State, presets, and export | `lib/store/`, `lib/constants/`, `lib/export/` |
| Draft persistence and hooks | `lib/draft-storage.ts`, `hooks/` |
| Regression tests | `tests/` |

## Keep changes focused

- Reuse existing components and helpers before adding dependencies or abstractions.
- Use TypeScript and accessible controls; preserve keyboard and mobile behavior.
- Use theme tokens for UI colors. Custom colors belong in the user's design.
- Add a regression test for behavior changes. Check that editing, undo, draft restoration, and export still work when affected.
- Keep unrelated cleanup out of the PR. Comments should explain decisions that the code cannot.

## Verify

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run these from the repository root with `.env` configured. Check visual changes in a browser and verify exported output, not only the preview. Existing lint warnings should not grow.

## Open a pull request

Use a clear title such as `fix(text): preserve font weight`. Explain the problem, resulting behavior, and checks you ran. Link the issue (`Fixes #123` when fully resolved), and include screenshots or a short recording for UI changes.

For bug reports, include reproduction steps, expected and actual results, browser/OS, and relevant screenshots or errors. Contributions are licensed under [Apache 2.0](./LICENSE).
