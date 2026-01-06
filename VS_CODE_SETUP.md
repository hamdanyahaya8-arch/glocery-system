# VS Code Setup & Troubleshooting Guide

## Quick Start (Recommended Method)

### Method 1: Using npm (Easiest)

```bash
# 1. Navigate to project directory
cd /path/to/revenue-management-system

# 2. Clean install
rm -rf node_modules package-lock.json pnpm-lock.yaml

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## Alternative Methods

### Method 2: Using pnpm (Current Setup)

```bash
# 1. Install pnpm globally (if not installed)
npm install -g pnpm

# 2. Clean install
rm -rf node_modules

# 3. Install dependencies
pnpm install

# 4. Start development server
pnpm run dev
```

### Method 3: Using Yarn

```bash
# 1. Install yarn globally (if not installed)
npm install -g yarn

# 2. Clean install
rm -rf node_modules pnpm-lock.yaml package-lock.json

# 3. Install dependencies
yarn install

# 4. Start development server
yarn dev
```

---

## Common Errors & Solutions

### Error 1: ERESOLVE unable to resolve dependency tree

**Cause:** Peer dependency conflicts

**Solution:**
```bash
npm install --legacy-peer-deps
```

Or add to package.json:
```json
{
  "overrides": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

---

### Error 2: Cannot find module 'vite'

**Cause:** Dependencies not installed

**Solution:**
```bash
# Delete everything and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### Error 3: Failed to resolve entry for package "X"

**Cause:** Corrupted node_modules

**Solution:**
```bash
# Clean cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### Error 4: Port 5173 already in use

**Cause:** Another process using the port

**Solution:**

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

Or change port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000 // Use different port
  }
})
```

---

### Error 5: Module not found: Can't resolve './utils/storage'

**Cause:** File path issue

**Solution:**
Ensure all files are in correct locations:
```
/src
  /app
    /components
      - LoginPage.tsx
      - EntryPanel.tsx
      - DailySalesReport.tsx
      - StockManagement.tsx
      - HistoryPanel.tsx
      - SettingsPanel.tsx
      /ui
        - (all UI components)
    /utils
      - storage.ts
    - App.tsx
```

---

## VS Code Recommended Extensions

Install these extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
2. **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
3. **TypeScript Vue Plugin (Volar)** - Vue.volar
4. **ESLint** - dbaeumer.vscode-eslint
5. **Prettier - Code formatter** - esbenp.prettier-vscode

Install via VS Code:
1. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
2. Search for extension name
3. Click Install

---

## VS Code Settings for Project

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist` folder.

---

## Environment Variables

Create `.env` file in project root (if needed for future features):

```env
VITE_APP_NAME=Revenue Management System
VITE_APP_VERSION=1.0.0
```

Access in code:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Package Manager Comparison

| Feature | npm | pnpm | yarn |
|---------|-----|------|------|
| Speed | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Disk Space | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Compatibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Default | ✅ | ❌ | ❌ |

**Recommendation:** Use npm with `--legacy-peer-deps` for maximum compatibility

---

## Debugging in VS Code

### 1. Add Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 2. Set Breakpoints
1. Click left margin in code editor
2. Press F5 to start debugging

---

## Performance Tips

### 1. Faster Development Server
In `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    hmr: {
      overlay: false // Disable error overlay for faster updates
    }
  }
})
```

### 2. Reduce Bundle Size
```bash
# Analyze bundle
npm install --save-dev rollup-plugin-visualizer

# In vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer()
  ]
})
```

---

## Troubleshooting Checklist

If app doesn't work:

- [ ] Node.js version >= 18 installed? (`node --version`)
- [ ] Dependencies installed? (`ls node_modules`)
- [ ] Correct directory? (`pwd`)
- [ ] Port 5173 available?
- [ ] Browser cache cleared?
- [ ] No TypeScript errors? (Check VS Code Problems panel)
- [ ] LocalStorage enabled in browser?

---

## Getting Help

### Check Logs
```bash
# Development server logs
npm run dev -- --debug

# Build logs
npm run build -- --debug
```

### Common Commands
```bash
# Check npm version
npm --version

# Check node version
node --version

# List installed packages
npm list --depth=0

# Update packages
npm update

# Fix package-lock
npm install --package-lock-only
```

---

## Clean Reinstall (Nuclear Option)

If nothing else works:

```bash
# 1. Delete everything
rm -rf node_modules
rm -rf package-lock.json
rm -rf pnpm-lock.yaml
rm -rf .pnpm-store
rm -rf dist

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install --legacy-peer-deps

# 4. Try to run
npm run dev
```

If still not working, check:
1. Antivirus not blocking files
2. Sufficient disk space
3. File permissions correct
4. No corporate proxy blocking downloads

---

## Success Indicators

App is working correctly when you see:

```
✓ built in XXXms

VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

And browser opens showing the login page with:
- "Revenue Management" title
- Username dropdown (BOSS/EMPLOYEE)
- Password field
- Login button
- Default credentials listed

---

## Last Updated
January 4, 2026
