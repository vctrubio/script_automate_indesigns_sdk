#include "./utils/getters.js"
#include "./utils/run.js"

const MAKEFILE_DIR = "~/Desktop/indesign_script/"
const TEMPLATE_INDESIGN_FILE = "Template101.indd"
const ROOT_PROPERTY_DIR = '~/Desktop/indesign_script/test-properties/'
const READ_JSON_FILE_NAME = 'JSON-Fetch-Contentful.json'

function main() {
    if (typeof propertyUrl !== 'undefined') {
        // alert("Processing property: " + filePath); // Temporary for debugging
        const FILE_PATH = File(MAKEFILE_DIR + TEMPLATE_INDESIGN_FILE)
        app.open(FILE_PATH)
        const propertyDir = (ROOT_PROPERTY_DIR + propertyUrl + '/');
        const property = getPropertyByIdV2(propertyDir, READ_JSON_FILE_NAME)
        runv2(FILE_PATH, property, propertyDir)
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