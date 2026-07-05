import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const distDir = new URL('../dist', import.meta.url).pathname;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (extname(full) === '.js') {
      files.push(full);
    }
  }
  return files;
}

function addJsExtensions(code) {
  return code.replace(
    /((?:from|import)\s+['"])(\.\.?\/[^'"]*?)(['"])/g,
    (match, prefix, path, suffix) => {
      if (path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs')) {
        return match;
      }
      return `${prefix}${path}.js${suffix}`;
    },
  ).replace(
    /(import\(['"])(\.\.?\/[^'"]*?)(['"])/g,
    (match, prefix, path, suffix) => {
      if (path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs')) {
        return match;
      }
      return `${prefix}${path}.js${suffix}`;
    },
  );
}

const files = walk(distDir);
for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  const updated = addJsExtensions(original);
  if (original !== updated) {
    writeFileSync(file, updated, 'utf-8');
    console.log(`  ✓ ${file.replace(distDir, '')}`);
  }
}
console.log(`Done. Processed ${files.length} files.`);
