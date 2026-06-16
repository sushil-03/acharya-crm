import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const distClientDir = path.join(rootDir, 'dist/client');
const shellSrc = path.join(distClientDir, '_shell.html');

// 1. Copy client build artifacts to dist root (for Vite/Static preset compatibility)
if (fs.existsSync(distClientDir)) {
  // Copy all files and folders from dist/client to dist/ root
  const files = fs.readdirSync(distClientDir);
  for (const file of files) {
    const srcPath = path.join(distClientDir, file);
    const destPath = path.join(distDir, file);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('Copied dist/client files to dist root.');
}

// 2. Copy _shell.html to index.html in dist root and dist/client
const distIndexDest = path.join(distDir, 'index.html');
const clientIndexDest = path.join(distClientDir, 'index.html');
if (fs.existsSync(shellSrc)) {
  fs.copyFileSync(shellSrc, distIndexDest);
  fs.copyFileSync(shellSrc, clientIndexDest);
  console.log(`Copied ${shellSrc} to ${distIndexDest} and ${clientIndexDest}`);
}

// 3. Format .vercel/output (for TanStack Start preset compatibility)
const vercelOutputDir = path.join(rootDir, '.vercel/output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');
const vercelConfigPath = path.join(vercelOutputDir, 'config.json');
const vercelFunctionsDir = path.join(vercelOutputDir, 'functions');

if (fs.existsSync(vercelOutputDir)) {
  // Ensure static directory exists
  if (!fs.existsSync(vercelStaticDir)) {
    fs.mkdirSync(vercelStaticDir, { recursive: true });
  }

  // Copy shell to .vercel/output/static/index.html
  const vercelIndexDest = path.join(vercelStaticDir, 'index.html');
  if (fs.existsSync(shellSrc)) {
    fs.copyFileSync(shellSrc, vercelIndexDest);
    console.log(`Copied ${shellSrc} to ${vercelIndexDest}`);
  }

  // Remove functions folder if it exists
  if (fs.existsSync(vercelFunctionsDir)) {
    fs.rmSync(vercelFunctionsDir, { recursive: true, force: true });
    console.log(`Removed ${vercelFunctionsDir}`);
  }

  // Write static config.json
  const staticConfig = {
    version: 3,
    cleanUrls: true,
    routes: [
      {
        src: "/assets/(.*)",
        headers: {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      {
        handle: "filesystem"
      },
      {
        src: "/(.*)",
        dest: "/index.html"
      }
    ]
  };

  fs.writeFileSync(vercelConfigPath, JSON.stringify(staticConfig, null, 2), 'utf-8');
  console.log(`Updated ${vercelConfigPath} with static routing rules.`);
}
