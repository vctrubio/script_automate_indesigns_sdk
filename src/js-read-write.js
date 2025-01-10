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

function processProperty(urlName) {
    const propertyDir = path.join(dirPropertiesName, urlName);
    const jsonFilePath = path.join(propertyDir, JSON_FILENAME);

    console.log('Processing property:', urlName);
    try {
        // Check if JSON file exists and is readable
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`JSON file not found: ${jsonFilePath}`);
            return null;
        }

        // Read and parse the JSON-Fetch-Contentful.json file
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const propertyData = JSON.parse(jsonData);

        // Verify the property data has required fields
        if (!propertyData['Property-Url'] || !propertyData.Property) {
            console.error(`Invalid property data in ${jsonFilePath}`);
            return null;
        }

        // Update image paths to be absolute
        if (propertyData['Cover-Img']) {
            const imagesDir = path.join(propertyDir, 'Images');
            propertyData['Cover-Img'] = path.join(imagesDir, 'a.jpeg');
        }

        console.log(`Successfully processed property: ${urlName}`);
        console.log(propertyData)
        return propertyData;
    } catch (error) {
        console.error(`Error processing property ${urlName}:`, error.message);
        return null;
    }
}

async function main() {
    const subdirs = listSubDirectories(dirPropertiesName);

    if (subdirs.length === 0) {
        console.log('No subdirectories found');
        return;
    }

    console.log('Processing properties...');
    const processedProperties = [];
    
    for (const dir of subdirs) {
        const propertyData = processProperty(dir);
        if (propertyData) {
            processedProperties.push(propertyData);
        }
    }

    if (processedProperties.length === 0) {
        console.log('No valid properties found to process');
        return;
    }

    console.log(`Successfully processed ${processedProperties.length} properties`);
    console.log('Preparing InDesign script...');
    
    // Copy the InDesign script to the Scripts Panel
    const scriptSource = path.join(process.cwd(), 'src', 'js-script.jsx');
    const scriptDest = '/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel/js-script.jsx';
    
    fs.copyFileSync(scriptSource, scriptDest);
    console.log('InDesign script copied to Scripts Panel');
    
    // Run the AppleScript to execute the InDesign script
    const { exec } = require('child_process');
    exec('osascript apple_script/run.scpt', (error, stdout, stderr) => {
        if (error) {
            console.error('Error running InDesign script:', error);
            return;
        }
        console.log('InDesign script executed successfully');
    });
}

main();