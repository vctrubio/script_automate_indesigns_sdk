const fs = require('fs');
const path = require('path');

// Get script name from command line argument or use default
const SCRIPT_NAME = process.argv[2] || 'js-script.jsx';

// Define paths
const INDESIGN_SCRIPTS_PATH = '/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel';
const SOURCE_DIR = path.join(process.env.HOME, 'Desktop/indesign_script/src');

// Source and destination paths
const sourcePath = path.join(SOURCE_DIR, SCRIPT_NAME);
const destPath = path.join(INDESIGN_SCRIPTS_PATH, SCRIPT_NAME);

try {
    // Create Scripts Panel directory if it doesn't exist
    if (!fs.existsSync(INDESIGN_SCRIPTS_PATH)) {
        fs.mkdirSync(INDESIGN_SCRIPTS_PATH, { recursive: true });
        console.log('Created Scripts Panel directory');
    }

    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Successfully copied script to:\n${destPath}`);
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`Error: Source file not found at ${sourcePath}`);
    } else {
        console.error('Error:', error.message);
    }
    process.exit(1);
}