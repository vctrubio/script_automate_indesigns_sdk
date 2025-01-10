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

// Main function to export
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
                    "{{Property-Url}}": property["Property-Url"]
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

// Export the function
$.global.getPropertyById = getPropertyById;

