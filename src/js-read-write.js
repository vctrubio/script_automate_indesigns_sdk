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

function runSubDir(urlName) {
    const getEnvPath = path.join(dirPropertiesName, urlName);
    const jsonFilePath = path.join(getEnvPath, JSON_FILENAME);

    console.log('Processing directory:', urlName);
    try {
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`JSON file not found: ${jsonFilePath}`);
            return;
        }
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const propertyData = JSON.parse(jsonData);
        console.log("🚀 ~ runSubDir ~ propertyData:", propertyData)
        return propertyData;
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
        return null;
    }
}

function main() {
    const subdirs = listSubDirectories(dirPropertiesName);

    if (subdirs.length === 0) {
        console.log('No subdirectories found');
    } else {
        subdirs.forEach(dir => runSubDir(dir));
    }
}

main()