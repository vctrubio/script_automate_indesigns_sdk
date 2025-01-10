#include "./utils/getters.js"

const MAKEFILE_DIR = "~/Desktop/indesign_script/"
const TEMPLATE_INDESIGN_FILE = "Template101.indd"
const ROOT_PROPERTY_DIR = '~/Desktop/indesign_script/test-properties/'
const READ_JSON_FILE_NAME = 'JSON-Fetch-Contentful.json'

function main() {
    if (typeof propertyUrl !== 'undefined') {
        // alert("Processing property: " + filePath); // Temporary for debugging
        app.open(File(MAKEFILE_DIR + TEMPLATE_INDESIGN_FILE))
        const propertyDir = (ROOT_PROPERTY_DIR + propertyUrl + '/');
        getPropertyByIdV2(propertyDir, READ_JSON_FILE_NAME, propertyUrl)
    } else {
        alert("No valid URL.");
    }
}

try {
    main();
} catch (error) {
    $.writeln("Error executing main(): " + error.message);
    throw error;
}