import os
import sys
import zipfile
import shutil

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
output_zip = os.path.join(root_dir, 'amifresh-source-code.zip')
temp_dir = os.path.join(root_dir, 'temp_linux_pack')

if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, ignore_errors=True)
os.makedirs(temp_dir, exist_ok=True)

print("1. Copying source directories...")
dirs_to_copy = ['app', 'components', 'lib', 'models', 'public', 'services', 'types']
for d in dirs_to_copy:
    src = os.path.join(root_dir, d)
    if os.path.exists(src):
        shutil.copytree(src, os.path.join(temp_dir, d))

print("2. Copying config and root files...")
files_to_copy = [
    'package.json',
    'package-lock.json',
    'next.config.ts',
    'tsconfig.json',
    'next-env.d.ts',
    'server.js',
    'schema.sql',
    'install-db.php',
    'postcss.config.mjs',
    'eslint.config.mjs'
]
for f in files_to_copy:
    src = os.path.join(root_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(temp_dir, f))

# Write production .env
env_content = """NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=u789152685_amifresh_sakhi
DB_PASSWORD=Amifresh@1234
DB_NAME=u789152685_sakhi_database
AUTH_SECRET=my_super_secret_auth_secret_key_123!
NEXTAUTH_URL=https://sakhi.amifresh.in
WHATSAPP_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTcyMjcxYTlkZjVjMGMzYTJmZTg2MCIsIm5hbWUiOiJBbWlGcmVzaCBGb29kcyBJbmRpYSBQdnQuIEx0ZCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2ODkxYjNjZDBhZGQ4YTBjMGU2OWYzZDEiLCJhY3RpdmVQbGFuIjoiUFJPX01PTlRITFkiLCJpYXQiOjE3OTE0NDkxMDF9.4n_cG5-WH--s1rH-TGYS6d8-fj0PcywCKcE5TA1uHJE
WHATSAPP_CAMPAIGN_ORDER_DELIVERED=order_delivred
WHATSAPP_CAMPAIGN_SAKHI_REG=sakhi_reg
WHATSAPP_CAMPAIGN_SAKHI_APPROVED=sakhi_approved1
WHATSAPP_CAMPAIGN_SAKHI_ACCOUNT_CREATED=sample_given1
WHATSAPP_CAMPAIGN_SAKHI_FAILED=sakhi_failed
ROOT_ADMIN_LOGIN_ID=ADMIN001
ROOT_ADMIN_EMAIL=admin@amifresh.com
ROOT_ADMIN_PASSWORD=admin123
ROOT_ADMIN_SYNC=false
"""
with open(os.path.join(temp_dir, '.env'), 'w', encoding='utf-8') as ef:
    ef.write(env_content)

if os.path.exists(output_zip):
    os.remove(output_zip)

print("3. Creating ZIP with explicit Linux/POSIX permissions (755 for dirs, 644 for files)...")
with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(temp_dir):
        # Sort for deterministic archive
        dirs.sort()
        files.sort()
        for d in dirs:
            full_path = os.path.join(root, d)
            rel_path = os.path.relpath(full_path, temp_dir).replace('\\', '/') + '/'
            zinfo = zipfile.ZipInfo(rel_path)
            zinfo.create_system = 3  # 3 = UNIX
            # 0o040755: Directory attribute + rwxr-xr-x (chmod 755)
            zinfo.external_attr = (0o040755 << 16) | 0x10
            zf.writestr(zinfo, '')
        
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, temp_dir).replace('\\', '/')
            zinfo = zipfile.ZipInfo(rel_path)
            zinfo.create_system = 3  # 3 = UNIX
            # 0o100644: Regular file attribute + rw-r--r-- (chmod 644)
            zinfo.external_attr = 0o100644 << 16
            with open(full_path, 'rb') as fp:
                zf.writestr(zinfo, fp.read())

shutil.rmtree(temp_dir, ignore_errors=True)

size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"[SUCCESS] Created {output_zip} ({size_mb:.2f} MB) with POSIX 755/644 permissions!")
