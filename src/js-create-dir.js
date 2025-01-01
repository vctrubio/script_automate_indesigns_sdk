const fs = require('fs');
const { json } = require('stream/consumers');
const prompt = require('prompt-sync')();

const ROOT_DIR = '../';

const NAME = 'JSON-Fetch-Contentful.json' // for forward compatibility
const jsonFilePath = ROOT_DIR + 'json-data/properties-data.json' // Make sure exist

const dirPropertiesName = 'test-properties'; //where to pout the property dir information

/*
{
  "date": "30.12.24",
  "entity": "properties",
  "length": 12,
  "properties": []
}
*/
function getJsonType(jsonFilePath) {
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonObject = JSON.parse(jsonData);
    // console.log(jsonObject.properties);
    return jsonObject;
}
//


/*
create dir and place property by propertyIdDir - read the documenation.md
ROOT_DIR/properties/property-url/files,dir
file1: property-json
dir1: Images- property image download folder - for uplodaing to indesign
*/
function createDir(dirName) {
    const jsonObject = getJsonType(jsonFilePath);

    try {
        if (!fs.existsSync(`../${dirName}`)) {
            fs.mkdirSync(`../${dirName}`);
        }

        var skip = 0;
        for (let i = 0; i < jsonObject.properties.length; i++) {
            const property = jsonObject.properties[i];
            const property_url = property['Property-Url']
            const propertyDir = `${dirName}/${property_url}`;

            if (!fs.existsSync(`../${propertyDir}`)) {
                fs.mkdirSync(`../${propertyDir}`);
            } else {
                if (skip > 0) continue;

                console.log(`\x1b[33m%s\x1b[0m`, `WARNING: ${propertyDir} already exists`);
                const response = prompt('Directory already exists. Do you want to overwrite it? (y/n/q/c): ');

                if (response.toLowerCase() === 'y') {
                    console.log(`Property ${property_url}: overwritten sxuccessfully!`);
                } else if (response.toLowerCase() === 'q') {
                    console.log('\x1b[30m%s\x1b[0m', `Safe exit. Property ${property_url} not overwritten.`);
                    return
                } else if (response.toLowerCase() === 'n') {
                    console.log('\x1b[30m%s\x1b[0m', `Property ${property_url}: without changes.`);
                    continue
                }
                else if (response.toLowerCase() === 'c') {
                    skip++;
                    console.log(`Continuing... `);
                }
            }

            const filePath = `../${propertyDir}/${NAME}`;
            const propertyJson = JSON.stringify(property);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the existing file
            }
            fs.writeFileSync(filePath, propertyJson);
            fs.chmodSync(filePath, '444'); // Set file to read-only for the user

            console.log('\x1b[32m%s\x1b[0m', `${property_url} √`);
        }
    }
    catch (err) {
        console.error(err);
    }
    return
}
//

function listProperties(jsonObject) {
    var propertyUrls = []
    for (let i = 0; i < jsonObject.properties.length; i++) {
        const property = jsonObject.properties[i];
        const property_url = property['Property-Url']
        propertyUrls.push(property_url);
    }
    return propertyUrls
}


function firePropertyImageDir(propertyUrls) {

    for (const propertyUrl of propertyUrls) {
        // console.log(propertyUrl);
        const propertyDir = `${dirPropertiesName}/${propertyUrl}`;
        const photoDir = `${propertyDir}/images`;

        if (!fs.existsSync(`../${photoDir}`)) {
            fs.mkdirSync(`../${photoDir}`);
            console.log(`\x1b[32m%s\x1b[0m`, `SUCCESS: ${photoDir} created`);
        }
        else {
            console.log(`\x1b[33m%s\x1b[0m`, `WARNING: ${photoDir} already exists`);
        }
    }

}



// createDir('test-properties');
// createPhotoDir(dirPhoto)


function main() {
    jsonObject = getJsonType(jsonFilePath);
    createDir(dirPropertiesName);
    const lst = listProperties(jsonObject);
    firePropertyImageDir(lst);
}


main()