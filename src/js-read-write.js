const { dirPropertiesName, JSON_FILENAME } = require('./utils/nodeConfig');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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
        const imagesDir = path.join(propertyDir, 'images');
        propertyData['Cover-Img'] = path.join(imagesDir, 'a.jpeg');
        propertyData['Extra-Img'] = path.join(imagesDir, 'b.jpeg');
        
        return propertyData;
    } catch (error) {
        console.error(`Error processing property ${urlName}:`, error.message);
        return null;
    }
}

async function processPropertyWithInDesign(propertyData) {
    const propertyUrl = propertyData['Property-Url']; //propertyUrl does not need sanitazion

    try {
        const { stdout, stderr } = await execPromise(
            `osascript apple_script/noderunner.scpt "${propertyUrl}"`
        );

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout.trim() === 'success';
    } catch (error) {
        console.error(`❌ Failed to process ${propertyUrl}:`, error.message);
        return false;
    }
}

async function main() {
    const subdirs = listSubDirectories(dirPropertiesName);

    if (subdirs.length === 0) {
        console.log('❌ No subdirectories found');
        return;
    }

    console.log('🚀 Starting property processing...\n');

    let successCount = 0;
    let failCount = 0;
    const successfulProperties = [];

    for (const dir of subdirs) {
        const propertyDir = path.join(dirPropertiesName, dir);
        const propertyData = processProperty(dir);

        if (!propertyData) {
            console.log(`⚠️  Skipping ${dir} - Invalid or missing data`);
            failCount++;
            continue;
        }

        process.stdout.write(`⏳ Processing ${propertyData['Property-Url']}...\n`);

        const success = await processPropertyWithInDesign(propertyData);

        if (success) {
            process.stdout.write('\r✅ Completed ' + propertyData['Property-Url']+ '\n');
            successCount++;
            successfulProperties.push(propertyData['Property-Url']);
        } else {
            process.stdout.write('\r❌ Failed ' + propertyData['Property-Url']+ '\n');
            failCount++;
        }
    }

    // console.log('\n📊 Summary:');
    // console.log(`✅ Successfully processed: ${successCount}`);
    // console.log(`❌ Failed: ${failCount}`);
    // console.log(`📝 Total properties: ${subdirs.length}`);

    if (successfulProperties.length > 0) {
        console.log('\n✨ Successfully processed properties:');
        successfulProperties.forEach((prop, index) => {
            console.log(`${index + 1}. ${prop}`);
        });
    }
    console.log(); // Empty line at the end
}

main().catch(console.error);
