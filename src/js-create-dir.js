const fs = require('fs');
const prompt = require('prompt-sync')();

const NAME = 'JSON-Fetch-Contentful.json'
// Fetch, create, and write to a Property directory

const ROOT_DIR = '../';
const jsonFilePath = ROOT_DIR + 'json-data/properties-data.json'
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

const dirPath = ROOT_DIR + '/properties';
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
                const response = prompt('Directory already exists. Do you want to overwrite it? (y/n/c/s): ');

                if (response.toLowerCase() === 'y') {
                    console.log(`Property ${property.property_url} overwritten successfully!`);
                } else if (response.toLowerCase() === 'n') {
                    console.log(`Skipping property ${property.property_url}`);
                    return
                } else if (response.toLowerCase() === 'c') {
                    console.log('Continuing without changes.');
                    continue
                }
                else if (response.toLowerCase() === 's') {
                    skip++;
                    console.log(`Skipping ALL `);
                }
            }

            const propertyJson = JSON.stringify(property)
            fs.writeFileSync(`../${propertyDir}/${NAME}`, propertyJson);
            console.log('\x1b[32m%s\x1b[0m', `${property_url} √`);
        }
        console.log('finished')
    }
    catch (err) {
        console.error(err);
    }
    return
}

//
createDir('test-properties');

function createPropertyDirectory(jsonFilePath) {


    const properties = jsonObject.properties;
    // properties.forEach((property) => {
    //     const dirName = property.title;
    //     fs.mkdir(`../${dirName}`, (err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log(`Directory ${dirName} created successfully!`);
    //         }
    //     });
    // });



}



function main() {
    console.log('main')
    // getJsonType(jsonFilePath)

}
