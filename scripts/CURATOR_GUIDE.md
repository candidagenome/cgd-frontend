# Curator Guide: Running CGD Frontend Locally

This guide explains how to run the CGD frontend on your laptop to preview changes to help docs and other pages.

## One-Time Setup

### 1. Install Node.js

Open Terminal and run these commands:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

Verify installation:
```bash
node --version   # Should show v18 or higher
npm --version    # Should show a version number
```

> **Note:** If you already have Homebrew, just run `brew install node`.

### 2. Clone the Repository

```bash
cd ~
git clone https://github.com/candidagenome/cgd-frontend.git
cd cgd-frontend
```

### 3. Install Dependencies

```bash
npm install
```

This only needs to be done once (or after pulling new changes that update dependencies).

### 4. Configure API Connection

Create a file to connect to the dev backend:

```bash
echo "VITE_API_URL=https://backend.dev.candidagenome.org" > .env.local
```

This file is git-ignored and only needs to be created once.

## Making Edits

### 1. Create a Local Branch

Always work on a branch, not directly on main:

```bash
cd ~/cgd-frontend

# Make sure you have the latest main
git checkout main
git pull

# Create and switch to a new branch (use your name and what you're changing)
git checkout -b fix-go-help
```

### 2. Edit Files with Emacs or Vi

```bash
# Using Emacs
emacs src/pages/help/WhatIsGOHelp.jsx

# Or using Vi
vi src/pages/help/WhatIsGOHelp.jsx
```

**Emacs basics:**
- Save: `Ctrl+x Ctrl+s`
- Quit: `Ctrl+x Ctrl+c`

**Vi basics:**
- Edit mode: Press `i`
- Exit edit mode: Press `Esc`
- Save and quit: Type `:wq` then Enter
- Quit without saving: Type `:q!` then Enter

### 3. Preview Your Changes

Start the local server (see below) and view your changes in the browser.

## Starting the Local Server

```bash
cd ~/cgd-frontend
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open your browser and go to: **http://localhost:5173/**

## Viewing Help Pages

Help pages are available at URLs like:
- http://localhost:5173/help/what-is-go
- http://localhost:5173/help/batch-download
- http://localhost:5173/help/patmatch

## Help Page Files

Help doc files are located in `src/pages/help/`:

| URL | File |
|-----|------|
| /help/what-is-go | `WhatIsGOHelp.jsx` |
| /help/batch-download | `BatchDownloadHelp.jsx` |
| /help/blast | `BlastHelp.jsx` |
| /help/go-term-finder | `GOTermFinderHelp.jsx` |
| /help/go-slim | `GOSlimHelp.jsx` |
| /help/patmatch | `PatmatchHelp.jsx` |
| /help/jbrowse | `JBrowseHelp.jsx` |
| /help/locus | `LocusHelp.jsx` |
| /help/phenotype | `PhenotypeHelp.jsx` |
| /help/getting-started | `GettingStartedHelp.jsx` |

See all help files in `src/pages/help/`.

## Committing Your Changes

After you're happy with your changes:

```bash
# See what files you changed
git status

# Add your changes
git add src/pages/help/WhatIsGOHelp.jsx

# Commit with a message
git commit -m "docs: update GO help page"

# Push your branch to GitHub
git push -u origin fix-go-help
```

Then ask a developer to review and merge your changes.

## Stopping the Server

Press `Ctrl+C` or `Ctrl+D` in the Terminal to stop the server.

## Pulling Latest Changes

Before making changes, pull the latest version:
```bash
cd ~/cgd-frontend
git pull
npm install   # Only if package.json changed
```

## Setting Up GitHub Credentials

If Git asks for your username and password when pushing, you can configure your credentials.

### Set Your Identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Store Credentials (so you don't have to enter them every time)

**Option 1: Use macOS Keychain (Recommended for Mac)**
```bash
git config --global credential.helper osxkeychain
```

**Option 2: Cache credentials temporarily (15 minutes by default)**
```bash
git config --global credential.helper cache
```

**Option 3: Cache credentials for longer (e.g., 1 hour = 3600 seconds)**
```bash
git config --global credential.helper 'cache --timeout=3600'
```

> **Note:** GitHub no longer accepts passwords for HTTPS. You'll need to use a Personal Access Token (PAT) instead of your password. Generate one at: https://github.com/settings/tokens

## Troubleshooting

### "command not found: npm"
Node.js is not installed. See "Install Node.js" above.

### "Module not found" errors
Run `npm install` to install dependencies.

### Port 5173 already in use
Another server is running. Stop it or use a different port:
```bash
npm run dev -- --port 3000
```

### Changes not showing
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check the Terminal for error messages
