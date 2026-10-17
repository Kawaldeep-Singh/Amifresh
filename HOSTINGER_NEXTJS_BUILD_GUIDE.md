# 🚀 Next.js Production Build & Deployment Guide for Hostinger (Shared / Cloud / cPanel)

> **Purpose**: This guide is a complete, battle-tested standard for deploying any **Next.js (App Router / Pages Router)** application to **Hostinger Shared Hosting, Cloud Hosting, or cPanel/CloudLinux** servers without build failures, permission issues, or runtime crashes.
> 
> 💡 **For AI Models**: When asked to *"create a Hostinger build"* for a Next.js project, strictly follow every rule and step in this guide.

---

## 📌 1. Why Hostinger Shared Hosting Fails (Common Traps & Solutions)

| Issue on Hostinger | Why it happens | The Permanent Solution |
| :--- | :--- | :--- |
| **403 Forbidden / Cannot read files** | Zip files created on Windows do NOT carry Linux POSIX file permissions. Folders get extracted with `000` or broken permissions. | **Never use standard Windows Right-Click -> Send to Zip**. Use our bundled Python script which injects explicit `chmod 755` for folders and `chmod 644` for files. |
| **"Cannot find module / Application Failed to Start"** | Hostinger's Node.js Manager (Phusion Passenger) does NOT run `npm start` or `next start`. It requires an entrypoint JS file. | Create a dedicated `server.js` in the project root and configure it as the **Application startup file** in hPanel. |
| **Out of Memory (OOM) / "Killed" during build** | Hostinger Shared Hosting limits RAM (often 1GB - 2GB). Running `npm run build` directly on the server crashes if pages are complex. | Always run and verify `npm run build` locally on your machine **before** packing. On server, build with `--webpack` or run pre-tested source. |
| **Database Connection Refused (ECONNREFUSED)** | Developers often put `localhost:3306` with incorrect credentials or remote IP. | On Hostinger, MySQL is on the **same server** (`localhost` or `127.0.0.1`, port `3306`). Hostinger databases have prefixes (e.g. `u123456_dbname`). |
| **Missing .env in Zip** | Hidden dotfiles (`.env`, `.gitignore`) are skipped by default file managers. | Packaging script must explicitly create and include a clean production `.env` with production keys and secrets. |

---

## 🛠️ 2. Essential Project Files & Configurations

### A. Custom Entrypoint: `server.js` (Mandatory for Hostinger)
Hostinger Node.js selector needs a standalone Node script to run. Create `server.js` in your project root:

```javascript
// server.js - Custom Next.js server for Hostinger / cPanel Node.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> App running on port ${port} in ${dev ? 'development' : 'production'} mode`);
    });
});
```

---

### B. Next.js Configuration: `next.config.ts` (or `next.config.js`)
Ensure memory-efficient and standalone builds:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Generates standalone build trace
  compress: true,       // Gzip/Brotli compression
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    // Optional: prevents build halts from non-critical third-party type discrepancies
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

---

### C. Build Script in `package.json`
Hostinger runs standard Node. To avoid Turbopack compatibility issues on CloudLinux / older glibc, configure the build script to use `--webpack`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build --webpack",
  "start": "node server.js"
}
```

---

### D. Production Environment Template: `.env`
Ensure these fundamental keys are set:

```env
NODE_ENV=production
PORT=3000

# Database Configuration (Hostinger is always localhost)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=uXXXXXX_dbuser
DB_PASSWORD=YourStrongPasswordHere
DB_NAME=uXXXXXX_dbname

# Authentication & Production Domain
AUTH_SECRET=generate_a_random_32_character_string_here
NEXTAUTH_URL=https://yourdomain.com
```

---

## 📦 3. Automated Packaging Script: `scripts/build-linux-zip.py`

This script solves the **#1 reason** deployments fail on Hostinger: **Windows Zip permission loss**.  
It builds a clean zip with **Linux POSIX attributes (`755` for directories, `644` for files)** and excludes heavy junk like `.git` and `node_modules`.

Create `scripts/build-linux-zip.py`:

```python
import os
import sys
import zipfile
import shutil

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
output_zip = os.path.join(root_dir, 'production-deploy.zip')
temp_dir = os.path.join(root_dir, 'temp_linux_pack')

if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, ignore_errors=True)
os.makedirs(temp_dir, exist_ok=True)

print("1. Copying source directories...")
# Add/remove folders relevant to your project:
dirs_to_copy = ['app', 'components', 'lib', 'models', 'public', 'services', 'types', 'pages', 'styles']
for d in dirs_to_copy:
    src = os.path.join(root_dir, d)
    if os.path.exists(src):
        shutil.copytree(src, os.path.join(temp_dir, d))

print("2. Copying configuration files...")
files_to_copy = [
    'package.json',
    'package-lock.json',
    'next.config.ts',
    'next.config.js',
    'next.config.mjs',
    'tsconfig.json',
    'next-env.d.ts',
    'server.js',
    'schema.sql',
    'postcss.config.mjs',
    'postcss.config.js',
    'eslint.config.mjs'
]
for f in files_to_copy:
    src = os.path.join(root_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(temp_dir, f))

# 3. Copy production .env
env_src = os.path.join(root_dir, '.env')
if os.path.exists(env_src):
    shutil.copy2(env_src, os.path.join(temp_dir, '.env'))

if os.path.exists(output_zip):
    os.remove(output_zip)

print("3. Creating ZIP with explicit Linux POSIX permissions (755 dirs, 644 files)...")
with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(temp_dir):
        dirs.sort()
        files.sort()
        for d in dirs:
            full_path = os.path.join(root, d)
            rel_path = os.path.relpath(full_path, temp_dir).replace('\\', '/') + '/'
            zinfo = zipfile.ZipInfo(rel_path)
            zinfo.create_system = 3  # 3 = UNIX / Linux
            zinfo.external_attr = (0o040755 << 16) | 0x10  # chmod 755
            zf.writestr(zinfo, '')
        
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, temp_dir).replace('\\', '/')
            zinfo = zipfile.ZipInfo(rel_path)
            zinfo.create_system = 3  # 3 = UNIX / Linux
            zinfo.external_attr = 0o100644 << 16  # chmod 644
            with open(full_path, 'rb') as fp:
                zf.writestr(zinfo, fp.read())

shutil.rmtree(temp_dir, ignore_errors=True)

size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"[SUCCESS] Created {output_zip} ({size_mb:.2f} MB) with POSIX 755/644 permissions!")
```

---

## 🌐 4. Hostinger hPanel Step-by-Step Deployment Flow

### Step 1: Database Setup in hPanel
1. Open **hPanel** ➔ **Databases** ➔ **Management**.
2. Create a new MySQL Database:
   - Note down: `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
3. Open **phpMyAdmin** for this database and import `schema.sql` (if using MySQL).

---

### Step 2: Upload & Extract Code
1. Open **hPanel** ➔ **File Manager**.
2. Navigate to your domain's folder (e.g. `public_html` or `/domains/yourdomain.com/public_html`).
3. Upload `production-deploy.zip` (or `amifresh-source-code.zip`).
4. **Extract** the zip directly into the root folder.
5. Verify that `.env` is present in the root folder.

---

### Step 3: Configure Node.js Application in hPanel
1. In hPanel, go to **Websites** ➔ **Node.js** (or search "Node.js").
2. Click **Create Application**:
   - **Node.js version**: `20.x` or `22.x` (LTS recommended)
   - **Application mode**: `Production`
   - **Application root**: `public_html` (where your files were extracted)
   - **Application startup file**: `server.js`
   - **Application URL**: Select your domain (`https://yourdomain.com`)
3. Add Environment Variables (from your `.env`):
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `DB_HOST` = `127.0.0.1`
   - `DB_USER` = `uXXXX_dbuser`
   - `DB_PASSWORD` = `your_password`
   - `DB_NAME` = `uXXXX_dbname`
   - `NEXTAUTH_URL` = `https://yourdomain.com`
   - `AUTH_SECRET` = `your_secret`
4. Click **Create / Save**.

---

### Step 4: Install Dependencies & Build on Hostinger
Open Hostinger **Terminal / SSH** (or use the Node.js panel NPM buttons):
```bash
# 1. Enter the project directory
cd public_html

# 2. Install production dependencies
npm install

# 3. Build Next.js
npm run build
```

---

### Step 5: Start / Restart Application
In the Hostinger Node.js panel:
1. Click **Restart Application** (or **Start Application**).
2. Visit `https://yourdomain.com` in your browser.
3. Your Next.js app will be running live! 🎉

---

## 🤖 5. Copy-Paste Prompt for Future AI Models

> Whenever you need an AI to create a Hostinger-ready build for any Next.js repository, copy and paste the prompt below:

```markdown
Please prepare this Next.js project for production deployment on Hostinger Shared / Cloud hosting (Phusion Passenger / cPanel environment).

Follow these strict requirements:
1. Verify type-checking with `npx tsc --noEmit` and ensure it exits with code 0.
2. Ensure `next.config.ts` (or `next.config.js`) has `output: 'standalone'` and `compress: true`.
3. Ensure `server.js` exists in the root directory to act as the Phusion Passenger custom HTTP entrypoint on `process.env.PORT || 3000`.
4. Ensure `package.json` build script uses `next build --webpack` to avoid Turbopack binary issues on CloudLinux.
5. Run `npm run build` locally to verify that all routes compile with 0 errors.
6. Create an automated packaging script (`scripts/build-linux-zip.py`) that bundles all source directories and config files into a ZIP with explicit UNIX POSIX permissions (0o040755 for directories, 0o100644 for files). Do NOT include node_modules or .git.
7. Ensure the production `.env` contains DB_HOST=127.0.0.1, NEXTAUTH_URL, and production secrets.
8. Run the python script and provide the final deployable zip file.
```
