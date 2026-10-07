const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

const replacements = {
  'bg-indigo-600': 'bg-primary',
  'hover:bg-indigo-700': 'hover:bg-primary-dark',
  'text-indigo-600': 'text-primary',
  'border-indigo-600': 'border-primary',
  'focus:ring-indigo-500': 'focus:ring-primary',
  'focus-visible:ring-indigo-500': 'focus-visible:ring-primary',
  'border-indigo-500': 'border-primary',
  'text-indigo-700': 'text-primary-dark',
  'bg-indigo-50': 'bg-primary-light',
  'border-indigo-200': 'border-primary-light',
  'border-indigo-100': 'border-primary-light',
  'bg-indigo-100': 'bg-primary-light',
  'text-indigo-800': 'text-primary-dark',
  'hover:text-indigo-900': 'hover:text-primary-dark',
  'hover:text-indigo-800': 'hover:text-primary-dark',
  'hover:border-indigo-300': 'hover:border-primary',
  'text-indigo-500': 'text-primary',
  'bg-indigo-500': 'bg-primary',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(value);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

directories.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log('Replacement complete.');
