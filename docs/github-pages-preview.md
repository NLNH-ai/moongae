# GitHub Pages Preview

This project is full-stack, so GitHub Pages can only host a frontend preview.

The workflow at `.github/workflows/github-pages-preview.yml` builds the frontend in demo mode with:

- `VITE_DEMO_MODE=true`
- `VITE_GITHUB_PAGES=true`
- `VITE_ROUTER_MODE=hash`

What this means:

- public pages render with bundled demo data
- client-side routing works on GitHub Pages through hash routing
- admin login and backend APIs are intentionally disabled in the preview build

To use it:

1. Push this project to a GitHub repository.
2. Open `Settings > Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or run the `GitHub Pages Preview` workflow manually.
