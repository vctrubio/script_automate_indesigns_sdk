#include "config.js"

function formatPrice(price) {
    var num = Number(price);
    if (isNaN(num)) return "Precio: 0 €";
    var formattedPrice = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return "Precio: " + formattedPrice + " €";
}

function formatIbis(ibis) {
    var num = Number(ibis);
    if (isNaN(num) || num === 0) return "";
    var formattedIbis = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formattedIbis + " €";
}

function parseJSON(jsonString) {
    try {
        if (typeof JSON !== 'undefined') {
            return JSON.parse(jsonString);
        }
        return eval('(' + jsonString + ')');
    } catch (e) {
        alert('JSON Parse Error: ' + e);
        return null;
    }
}

//old n unused
function getPropertyById(propertyUrl) {
    if (!CONFIG.JSON_FILE_PATH.exists) {
        alert("JSON file not found: " + CONFIG.JSON_FILE_PATH.fsName);
        return null;
    }

    try {
        var propertiesFile = File(CONFIG.DIR_PATH + "json-data/properties-data.json");
        propertiesFile.open('r');
        var jsonString = propertiesFile.read();
        propertiesFile.close();
        var jsonData = parseJSON(jsonString);

        if (!jsonData || !jsonData.properties) {
            throw new Error("Invalid properties data");
        }

        // Find the property with matching URL
        for (var i = 0; i < jsonData.properties.length; i++) {
            var property = jsonData.properties[i];
            if (property["Property-Url"] === propertyUrl) {
                return {
                    "{{Title}}": property.Property.Title,
                    "{{Cover-Img}}": CONFIG.COVER_IMG,
                    "{{Extra-Img}}": CONFIG.EXTRA_IMG,
                    "{{Amentities}}": property.Amentities || {},
                    "{{Description}}": property.Property.Description,
                    "{{Characteristics}}": property.Characteristics,
                    "{{Precio}}": formatPrice(property.Property.Price.Price),
                    "{{Ibis-Mas}}": formatIbis(property.Property.Price.Ibis),
                    "{{Property-Url}}": property.propertyUrl
                };
            }
        }
        alert("Property not found with URL: " + propertyUrl);
        return null;
    } catch (e) {
        alert("Error reading or parsing properties file: " + e.message);
        return null;
    }
}

function getImagesFromDir(propertyDir) {
    const imageDir = new Folder(propertyDir + "/images");
    var images = [];

    if (imageDir.exists) {
        var files = imageDir.getFiles();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            images.push(file.fsName);
        }
    }
    else {
        alert("No images found in directory: " + imageDir.fsName);
    }

    if (images.length > 0) {
        images.sort();
    }
    else {
        var TMP_IMG = "~/Desktop/x-photos/a.jpeg";
        images.push(TMP_IMG);
        var TMP_IMG = "~/Desktop/x-photos/b.jpeg";
        images.push(TMP_IMG);
    }

    return images;
    /*
    osascript apple_script/noderunner.scpt "argonsola"
    Error running script: Uncaught JavaScript exception: Unable to read JPEG.
    error: Uncaught JavaScript exception: Unable to read JPEG.
    */
}

function getPropertyByIdV2(propertyDir, jsonFile) {
    try {
        const propertyJsonFile = File(propertyDir + jsonFile)
        propertyJsonFile.open('r');
        const jsonString = propertyJsonFile.read();
        propertyJsonFile.close();

        if (!jsonString)
            throw new Error("Invalid READ_JSON_FILE_NAME data");

        var propertyData = parseJSON(jsonString);
        const images = getImagesFromDir(propertyDir);
        return {
            "{{Property-Url}}": propertyData.propertyUrl,
            "{{Title}}": propertyData.Property.Title,
            "{{Cover-Img}}": images[0],
            "{{Extra-Img}}": images[1],
            "{{Amentities}}": propertyData.Amentities || {},
            "{{Description}}": propertyData.Property.Description,
            "{{Characteristics}}": propertyData.Characteristics,
            "{{Precio}}": formatPrice(propertyData.Property.Price.Price),
            "{{Ibis-Mas}}": formatIbis(propertyData.Property.Price.Ibis),
            "{{Property-Url}}": propertyData["Property-Url"]
        }
        exit(1)
    } catch (e) {
        alert("Error reading or parsing properties file: " + e.message);
        return null;
    }
}

// Export the function
$.global.getPropertyById = getPropertyById;
$.global.getPropertyByIdV2 = getPropertyByIdV2;

