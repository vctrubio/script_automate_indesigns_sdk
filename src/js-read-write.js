const { dirPropertiesName, JSON_FILENAME } = require('./utils/nodeConfig');
const fs = require('fs');
const path = require('path');

function listSubDirectories(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`Directory ${dirPath} does not exist`);
            return [];
        }

        const items = fs.readdirSync(dirPath);
        const directories = items.filter(item => {
            const fullPath = path.join(dirPath, item);
            return fs.statSync(fullPath).isDirectory();
        });

        return directories;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

function main() {
    console.log('Listing subdirectories in:', dirPropertiesName);
    const subdirs = listSubDirectories(dirPropertiesName);
    
    if (subdirs.length === 0) {
        console.log('No subdirectories found');
    } else {
        console.log('Subdirectories:');
        subdirs.forEach(dir => console.log(`- ${dir}`));
    }
}

main()