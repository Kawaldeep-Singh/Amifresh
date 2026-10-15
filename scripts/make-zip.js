const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const deployDir = path.join(rootDir, 'hostinger_upload');

if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

console.log('Copying standalone files...');
fs.cpSync(path.join(rootDir, '.next', 'standalone'), deployDir, { recursive: true });

console.log('Copying public folder...');
fs.cpSync(path.join(rootDir, 'public'), path.join(deployDir, 'public'), { recursive: true });

console.log('Copying static assets...');
const targetStatic = path.join(deployDir, '.next', 'static');
fs.mkdirSync(targetStatic, { recursive: true });
fs.cpSync(path.join(rootDir, '.next', 'static'), targetStatic, { recursive: true });

console.log('Creating production .env...');
const envContent = [
  'NODE_ENV=production',
  'PORT=3000',
  'DB_HOST=localhost',
  'DB_PORT=3306',
  'DB_USER=u789152685_amifresh_sakhi',
  'DB_PASSWORD=Amifresh@1234',
  'DB_NAME=u789152685_sakhi_amifresh',
  'AUTH_SECRET=my_super_secret_auth_secret_key_123!',
  'NEXTAUTH_URL=https://sakhi.amifresh.in'
].join('\n');
fs.writeFileSync(path.join(deployDir, '.env'), envContent, 'utf8');

console.log('Copying schema.sql and install-db.php...');
fs.copyFileSync(path.join(rootDir, 'schema.sql'), path.join(deployDir, 'schema.sql'));
if (fs.existsSync(path.join(rootDir, 'install-db.php'))) {
  fs.copyFileSync(path.join(rootDir, 'install-db.php'), path.join(deployDir, 'install-db.php'));
}

console.log('Adding .htaccess for reverse proxy...');
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
`;
fs.writeFileSync(path.join(deployDir, '.htaccess'), htaccessContent, 'utf8');

console.log('Creating ZIP archive...');
const zipFile = path.join(rootDir, 'amifresh-hostinger-deploy.zip');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

// Use powershell Compress-Archive
execSync(`powershell -Command "Compress-Archive -Path '${deployDir}\\*' -DestinationPath '${zipFile}' -CompressionLevel Optimal"`, {
  stdio: 'inherit'
});

console.log(`✅ Success! Deployment zip created at: ${zipFile}`);
const stats = fs.statSync(zipFile);
console.log(`ZIP file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
