---
inclusion: always
---

# Package Manager Guidelines

## Use pnpm for all package management operations

This project uses **pnpm** as the package manager. Always use pnpm commands instead of npm or yarn.

### Common Commands
- Install dependencies: `pnpm install`
- Add dependency: `pnpm add <package>`
- Add dev dependency: `pnpm add -D <package>`
- Run scripts: `pnpm run <script>` or `pnpm <script>`
- Remove package: `pnpm remove <package>`

### Never use:
- `npm install` → use `pnpm install`
- `npm run` → use `pnpm run` or `pnpm`
- `yarn add` → use `pnpm add`

### Evidence
The project has `pnpm-lock.yaml` which indicates pnpm is the chosen package manager.