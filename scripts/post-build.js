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

// 3. Delete .vercel and .output folders to prevent Vercel Build Output API/Serverless conflicts.
// This forces Vercel to deploy the 'dist' directory as a static SPA and respect vercel.json.
const vercelDir = path.join(rootDir, '.vercel');
if (fs.existsSync(vercelDir)) {
  fs.rmSync(vercelDir, { recursive: true, force: true });
  console.log('Deleted .vercel directory to prevent Build Output API conflicts.');
}

const outputDir = path.join(rootDir, '.output');
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  console.log('Deleted .output directory.');
}
