const https = require('https');
const fs = require('fs');
const prompt = require('prompt-sync')();
const path = require('path');

const ROOT_DIR = __dirname + '/../';

const NAME = 'JSON-Fetch-Contentful.json' // for forward compatibility
const jsonFilePath = ROOT_DIR + 'json-data/properties-data.json' // Make sure exist

const dirPropertiesName = 'test-properties/'; //where to pout the property dir information
const relativePath = path.join(__dirname, '..', dirPropertiesName);

/*
{
  "date": "30.12.24",
  "entity": "properties",
  "length": 12,
  "properties": []
}
*/
function getJsonType(jsonFilePath) {
    if (!fs.existsSync(jsonFilePath)) {
        throw new Error(`File not found: ${jsonFilePath}`);
    }
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonObject = JSON.parse(jsonData);
    return jsonObject;
}
//


/*
create dir and place property by propertyIdDir - read the documenation.md
ROOT_DIR/properties/property-url/files,dir
file1: property-json
dir1: Images- property image download folder - for uplodaing to indesign
*/
function createDir() {
    const jsonObject = getJsonType(jsonFilePath);

    //relative to makefile cmd

    try {
        if (!fs.existsSync(relativePath)) {
            fs.mkdirSync(relativePath);
            console.log(`\x1b[32m%s\x1b[0m`, `SUCCESS: ${relativePath} created`);
        } else {
            console.log(`\x1b[33m%s\x1b[0m`, `WARNING: ${relativePath} already exists`);
        }

        var skip = 0;
        console.log('\x1b[34m%s\x1b[0m', 'createDir :PITSTOP:')
        for (let i = 0; i < jsonObject.properties.length; i++) {
            const property = jsonObject.properties[i];
            const property_url = property['Property-Url']
            const propertyDir = path.join(relativePath, property_url);

            if (!fs.existsSync(propertyDir)) {
                fs.mkdirSync(propertyDir);
            } else {
                if (skip > 0) continue;
                console.log(`\x1b[33m%s\x1b[0m`, `WARNING: ${propertyDir} already exists`);
                const response = prompt('Directory already exists. Do you want to overwrite it? (y/n/q/c): ');

                if (response.toLowerCase() === 'y') {
                    console.log(`Property ${property_url}: overwritten successfully!`);
                } else if (response.toLowerCase() === 'q') {
                    console.log('\x1b[30m%s\x1b[0m', `Safe exit. Property ${property_url} not overwritten.`);
                    return
                } else if (response.toLowerCase() === 'n') {
                    console.log('\x1b[30m%s\x1b[0m', `Property ${property_url}: without changes.`);
                    continue
                } else if (response.toLowerCase() === 'c') {
                    skip++;
                    console.log(`Continuing... `);
                }
            }

            const filePath = path.join(propertyDir, NAME);
            const propertyJson = JSON.stringify(property, null, 2); // Format JSON with 2 spaces indentation
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
            }
            fs.writeFileSync(filePath, propertyJson);
            fs.chmodSync(filePath, '444'); // Set file to read-only for the user

            if (skip < 1)
                console.log('\x1b[32m%s\x1b[0m', `${property_url} √`);
        }
    }
    catch (err) {
        console.error(err);
    }
    return
}
//

/*
returns the property_urls inside the jsonObject
*/
function listProperties(jsonObject) {
    var propertyUrls = []
    for (let i = 0; i < jsonObject.properties.length; i++) {
        const property = jsonObject.properties[i];
        const property_url = property['Property-Url']
        propertyUrls.push(property_url);
    }
    return propertyUrls
}


/* do and destroy -property-img-a/b/c/d.jpeg
for later reading of indesign document
*/
async function firePropertyImageDir(jsonObject) {
    const propertyUrls = listProperties(jsonObject);

    console.log('\x1b[34m%s\x1b[0m', 'firePropertiesImages :PITSTOP:')
    try {
        let skipFlag = 0
        for (const propertyUrl of propertyUrls) {
            const propertyDir = path.join(relativePath, propertyUrl);
            const photoDir = path.join(propertyDir, 'images');

            if (!fs.existsSync(photoDir)) {
                fs.mkdirSync(photoDir);
                console.log(`\x1b[32m%s\x1b[0m`, `SUCCESS: ${photoDir} created`);
            } else {
                console.log(`\x1b[33m%s\x1b[0m`, `WARNING: ${photoDir} already exists`);
                if (skipFlag < 1) {
                    const response = prompt('Do you want to overwrite it? (y/n/q/c): ');
                    if (response.toLowerCase() === 'y') {
                        console.log(`Directory ${photoDir}: overwritten successfully!`);
                    } else if (response.toLowerCase() === 'c') {
                        skipFlag++
                    }
                    else if (response.toLowerCase() === 'n') {
                        console.log('\x1b[30m%s\x1b[0m', `Directory ${photoDir}: not overwritten.`);
                        continue;
                    }
                    else if (response.toLowerCase() === 'q') {
                        console.log('\x1b[30m%s\x1b[0m', `Safe exit from IMAGES PROCESS: ${photoDir} not overwritten.`);
                        return;
                    }

                }
            }

            const getImages = jsonObject.properties.filter(property => property['Property-Url'] === propertyUrl)[0]['Cover-Img'];
            let letter = 'a'.charCodeAt(0);
            let skip = 0;

            console.log('\x1b[34m%s\x1b[0m', ' createImgaes :PITSTOP:')
            for (const img of getImages) {
                if (skip > 0) continue
                const letterTransform = String.fromCharCode(letter);
                const path = `${photoDir}/${letterTransform}.jpeg`;
                if (fs.existsSync(path)) {
                    const response = prompt(`File ${path} already exists. Do you want to overwrite it? (y/n/q/c): `);

                    if (response.toLowerCase() === 'y') {
                        console.log(`File ${path}: overwritten successfully!`); } else if (response.toLowerCase() === 'q') {
                        console.log('\x1b[30m%s\x1b[0m', `Safe exit. File ${path} not overwritten.`);
                        return;
                    } else if (response.toLowerCase() === 'n') {
                        console.log('\x1b[30m%s\x1b[0m', `File ${path}: without changes.`);
                        continue;
                    } else if (response.toLowerCase() === 'c') {
                        console.log(`Continuing...`);
                        skip++
                    }
                }

                if (skip < 1)
                    await downloadImage(img, path);
                letter++;
            }
        }
    } catch {
        console.error('Error in firePropertyImageDir function');
    }
    console.log(`\x1b[32m%s\x1b[0m`, `firedPropertyImages complete....`);
}

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

function main() {
    try {
        const jsonObject = getJsonType(jsonFilePath);
        createDir();
        firePropertyImageDir(jsonObject);
    } catch (error) {
        if (error.message.includes('File not found')) {
            console.error('Error in main function.........:', error.message);
        } else {
            console.error('Unexpected error in main function:', error.message);
        }
    }
}

//node ./js-create-dir.js 
main();
