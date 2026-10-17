# AmiFresh Sakhi Portal - Hostinger / Shared Hosting Deployment Guide

Yeh branch (`SQL`) poori tarah se **MySQL Database** aur **Hostinger Shared Hosting** ke liye tayar (ready) hai.

---

## 📋 Database Details (Already Configured)
* **Database Name:** `u789152685_sakhi_database`
* **MySQL Username:** `u789152685_amifresh_sakhi`
* **MySQL Password:** `Amifresh@1234`
* **MySQL Host:** `localhost` (Hostinger server par `localhost` use hota hai)
* **Port:** `3306`
* **Domain:** `sakhi.amifresh.in`

---

## 🔑 Default Master Admin Credentials
* **Login URL:** `https://sakhi.amifresh.in/login`
* **Admin Email:** `admin@amifresh.com`
* **Admin Login ID:** `ADMIN001`
* **Password:** `admin123`

---

## 🚀 Step-by-Step Deployment on Hostinger

### Step 1: MySQL Database Table Create Karein (2 Options)

#### Option A: phpMyAdmin Import (Recommended)
1. Hostinger hPanel login karein.
2. **Databases** -> **Management** me jaakar `u789152685_sakhi_amifresh` ke aage **Enter phpMyAdmin** par click karein.
3. Upar menu me **Import** tab par click karein.
4. Project root me di gayi file [`schema.sql`](./schema.sql) ko select karein aur neeche **Go / Import** button dabayein.
5. Saari tables (`users`, `products`, `orders`, `commissions`, `audit_logs`, `referral_histories`, `settings`) aur Master Admin automatically ban jayenge.

*(Note: Agar aap phpMyAdmin se import nahi bhi karte, toh app ke start hone par `lib/mysql.ts` automatically `CREATE TABLE IF NOT EXISTS` chala deta hai).*

---

### Step 2: Code Upload Karein
1. Hostinger **File Manager** me jaayein.
2. Apne domain `sakhi.amifresh.in` ke root folder (jaise `public_html`) me is `SQL` branch ka code upload karein (zip karke upload karein aur extract kar dein).
   > *Note: `.next` aur `node_modules` upload karne ki zaroorat nahi hai, wo server par direct build ho jayenge.*

---

### Step 3: Node.js Application Setup (hPanel / cPanel)
1. Hostinger hPanel me **Advanced** / **Websites** section me **Node.js** par click karein.
2. **Create Application** par click karein:
   - **Node.js version:** `20.x` ya `22.x` select karein.
   - **Application mode:** `Production`
   - **Application root:** `public_html` (jahan code extract kiya hai)
   - **Application startup file:** `server.js` (project me already ready hai)
3. **Environment Variables** add karein:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=u789152685_amifresh_sakhi
   DB_PASSWORD=Amifresh@1234
   DB_NAME=u789152685_sakhi_database
   AUTH_SECRET=my_super_secret_auth_secret_key_123!
   NEXTAUTH_URL=https://sakhi.amifresh.in
   ```
4. **Save** karein.

---

### Step 4: Dependencies Install & Build Karein
Hostinger terminal / SSH me ya Node.js panel me:
```bash
npm install
npm run build
```
Build complete hone ke baad Node.js panel me **Restart Application** par click karein.

Aapki website **https://sakhi.amifresh.in** successfully live chalne lagegi! 🎉
