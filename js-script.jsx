// Define the InDesign Scripts Panel path
const INDESIGN_SCRIPTS_PATH = "/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel/";

const dirPath = "~/Desktop/indesign_script/";
var filePath = File(dirPath + "Template101.indd");
var jsonFilePath = File(dirPath + "template-test.json");

// Default placeholder values
var tmpPlaceholderValues = {
    "{{Title}}": "Henry FordJackson",
    "{{Cover-Img}}": "~/Desktop/EmilyRatajkowski.jpg",
    "{{Extra-Img}}": "~/Desktop/abcd.jpg",
    "{{Amentities}}": {
        "AC": true,
        "Heating": true,
        "Rooftop": false,
        "Furnished": true,
        "Portero": false,
        "Trastero": false,
        "Elevator": true,
        "Parking": false
    },
    "{{Description}}": "La distribución es la siguiente: Amplio hall de entrada que nos conducen a la zona de salón con 2 balcones a la calle...",
    "{{Characteristics}}": {
        "Tipo de Propiedad": "Residencial",
        "Dormitorios": "3",
        "Baños": "3",
        "Patios": "1",
        "Balcones": "2"
    },
    "{{Precio}}": "4000000",
    "{{Ibis-Mas}}": "LOL"
};

var placeholderValues;

// Add this JSON parsing function at the top of your file, after the constants
function parseJSON(jsonString) {
    try {
        // First try native JSON parser
        if (typeof JSON !== 'undefined') {
            return JSON.parse(jsonString);
        }
        
        // Fallback to eval if JSON is not available
        return eval('(' + jsonString + ')');
    } catch (e) {
        alert('JSON Parse Error: ' + e);
        return null;
    }
}

if (!jsonFilePath.exists) {
    alert("JSON QUIT FILE not found: " + jsonFilePath.fsName);
}


if (jsonFilePath.exists) {
    try {
        jsonFilePath.open('r');
        var jsonString = jsonFilePath.read();
        jsonFilePath.close();
        
        alert('GOOD we read the json file');
        var jsonData = parseJSON(jsonString);
        
        if (jsonData) {
            alert("JSON data parsed successfully");
            placeholderValues = {
                "{{Title}}": jsonData.Property.Title,
                // "{{Cover-Img}}": jsonData["Cover-Img"],
                // "{{Extra-Img}}": jsonData["Habitaciones-Paginas"][0]["Photos"][0] || "",
                "{{Cover-Img}}": tmpPlaceholderValues["{{Cover-Img}}"],
                "{{Extra-Img}}": tmpPlaceholderValues["{{Extra-Img}}"],
                "{{Amentities}}": jsonData.Amentities,
                "{{Description}}": jsonData.Property.Description,
                "{{Characteristics}}": jsonData.Characteristics,
                "{{Precio}}": jsonData.Property.Price.Price,
                "{{Ibis-Mas}}": jsonData.Property.Price.Ibis
            };
        } else {
            throw new Error("Failed to parse JSON data");
        }

    } catch (e) {
        alert("Error reading or parsing JSON file: " + e.message);
        app.exit();
    }
} else {
    alert("JSON file not found, using default values.");
    placeholderValues = tmpPlaceholderValues;
}

// Open the InDesign file
if (filePath.exists) {
    var doc = app.open(filePath);

    function createAmenitiesTable(page, textFrame, amenities) {
        var trueAmenities = [];
        for (var key in amenities) {
            if (amenities[key]) {
                trueAmenities.push(key);
            }
        }

        if (trueAmenities.length > 0) {
            var tableFrame = page.textFrames.add();
            tableFrame.geometricBounds = textFrame.geometricBounds; // Match the size and position of the placeholder
            var table = tableFrame.insertionPoints[0].tables.add();
            table.columnCount = 1;
            table.bodyRowCount = trueAmenities.length;

            for (var i = 0; i < trueAmenities.length; i++) {
                table.rows[i].cells[0].contents = trueAmenities[i];

                // if (i !== trueAmenities.length - 1) {
                //     table.rows[i].cells[0].bottomEdgeStrokeWeight = 1;
                //     table.rows[i].cells[1].bottomEdgeStrokeWeight = 1;
                // }
            }

            table.columns[0].width = 20; // Set the first column width to 200 points
        } else {
            textFrame.contents = "";
        }
    }

    function createCharacteristicsTable(page, textFrame, characteristics) {
        var keys = [];
        var values = [];

        for (var key in characteristics) {
            keys.push(key);
            values.push(characteristics[key]);
        }

        if (keys.length > 0) {
            var tableFrame = page.textFrames.add();
            tableFrame.geometricBounds = textFrame.geometricBounds; // Match the size and position of the placeholder
            var table = tableFrame.insertionPoints[0].tables.add();
            table.columnCount = 2; // Two columns for keys and values
            table.bodyRowCount = keys.length;

            for (var i = 0; i < keys.length; i++) {
                table.rows[i].cells[0].contents = keys[i]; // Column 1: Keys
                table.rows[i].cells[1].contents = values[i]; // Column 2: Values

                // Set bottom border for each row except the last one
                // if (i !== keys.length - 1) {
                //     table.rows[i].cells[0].bottomEdgeStrokeWeight = 1;
                //     table.rows[i].cells[1].bottomEdgeStrokeWeight = 1;
                // }

                // // Remove other borders for cleaner appearance
                // table.rows[i].cells[0].leftEdgeStrokeWeight = 0;
                // table.rows[i].cells[1].rightEdgeStrokeWeight = 0;
            }

            table.columns[0].width = 12;
            table.columns[1].width = 8;
        } else {
            textFrame.contents = "";
        }
    }

    // Iterate through all text frames and replace placeholders
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        for (var j = 0; j < page.textFrames.length; j++) {
            var textFrame = page.textFrames[j];
            var frameText = textFrame.contents;

            // Replace placeholders with values
            for (var placeholder in placeholderValues) {
                if (frameText.indexOf(placeholder) !== -1) {
                    // alert("Found placeholder: " + placeholder); // Debug alert
                    if (placeholder === "{{Amentities}}") {
                        createAmenitiesTable(page, textFrame, placeholderValues[placeholder]);
                        frameText = frameText.replace(placeholder, ""); // Remove the placeholder text
                    } else if (placeholder === "{{Characteristics}}") {
                        createCharacteristicsTable(page, textFrame, placeholderValues[placeholder]);
                        frameText = frameText.replace(placeholder, ""); // Remove the placeholder text
                    } else {
                        frameText = frameText.replace(placeholder, placeholderValues[placeholder]);
                    }
                }
            }
            textFrame.contents = frameText; // Update the text frame
        }

        // Iterate through all rectangles and replace image placeholders
        for (var k = 0; k < page.rectangles.length; k++) {
            var rectangle = page.rectangles[k];
            if (rectangle.label) {
                if (rectangle.label === "{{Cover-Img}}") {
                    rectangle.place(File(placeholderValues["{{Cover-Img}}"]));
                    rectangle.fit(FitOptions.CONTENT_AWARE_FIT); // Apply content-aware fit
                }
                else if (rectangle.label === "{{Index-Cover-Img-First}}") {
                    rectangle.place(File(placeholderValues["{{Extra-Img}}"]));
                    rectangle.fit(FitOptions.CONTENT_AWARE_FIT); // Apply content-aware fit
                }
                else if (rectangle.label === "{{Index-Cover-Img-Second}}") {
                    rectangle.place(File(placeholderValues["{{Extra-Img}}"]));
                    rectangle.fit(FitOptions.CONTENT_AWARE_FIT); // Apply content-aware fit
                }
            }
        }
    }

    var outputFilePath = dirPath + "OutputTest.indd";
    doc.save(new File(outputFilePath));
    doc.close(SaveOptions.NO);

    alert("Placeholders replaced and saved as: " + outputFilePath);
} else {
    alert("File not found: " + filePath.fsName);
    app.exit();
}

