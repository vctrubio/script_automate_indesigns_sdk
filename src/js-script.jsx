// Import config and getters
#include "./utils/config.js"
#include "./utils/getters.js"
#include "./utils/style.js"
#include "./utils/download.js"
#include "./utils/run.js"

function loadJsonData() {
    var propertyUrl = CONFIG.FICHA;
    return getPropertyById(propertyUrl);
}

function main() {
    var placeholderValues = loadJsonData();
    if (!placeholderValues) {
        app.exit();
        return;
    }

    if (!CONFIG.FILE_PATH.exists) {
        alert("Ficha NO GOOD");
        app.exit();
        return;
    }

    run(CONFIG.FILE_PATH, placeholderValues)
}

main();
