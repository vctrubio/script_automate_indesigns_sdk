const fs = require('fs');
const path = require('path');

function copyPdfFiles(srcDir) {
  const outputDir = path.join(__dirname, '../PDFS-properties');

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  function searchAndCopy(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        searchAndCopy(fullPath);
      } else if (path.extname(file).toLowerCase() === '.pdf') {
        const destPath = path.join(outputDir, file);
        fs.copyFileSync(fullPath, destPath);
        console.log(`Copied: ${fullPath} to ${destPath}`);
      }
    });
  }

  searchAndCopy(srcDir);
}

// Check if the script is run from the command line
if (require.main === module) {
  const args = process.argv.slice(2);
  let srcDir = null;
  if (args.length !== 1) 
    srcDir = 'test-properties';
  else
    srcDir = args[0];
  copyPdfFiles(srcDir);
}

console.log('hellwo')