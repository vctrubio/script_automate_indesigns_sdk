const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download an image
function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image. Status code: ${response.statusCode}`));
                return;
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close(() => resolve(outputPath));
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => reject(err)); // Cleanup on error
        });
    });
}

// Main function to handle input arguments and download
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node download_img_test.js.js <image_url> [output_directory]');
        process.exit(1);
    }

    const url = args[0];
    const outputDir = args[1] || './images'; // Default to ./images if no output directory is provided
    const fileName = path.basename(new URL(url).pathname); // Extract file name from URL
    const outputPath = path.join(outputDir, fileName);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        console.log(`Downloading image from: ${url}`);
        const savedPath = await downloadImage(url, outputPath);
        console.log(`Image saved to: ${savedPath}`);
    } catch (err) {
        console.error(`Error downloading image: ${err.message}`);
    }
}

// Run the script
main();
