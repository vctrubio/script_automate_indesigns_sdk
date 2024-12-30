const INDESIGN_SCRIPTS_PATH = "/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel/";
const dirPath = "~/Desktop/indesign_script/";
var filePath = File(dirPath + "Template101.indd");
var jsonFilePath = File(dirPath + "json-data/template-test.json");

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

// Add this function after the parseJSON function
function downloadImage(url, localPath) {
    try {
        // Create a Socket object
        var socket = new Socket();
        
        // Extract hostname and path from URL
        var urlParts = url.split('/');
        var hostname = urlParts[2];
        var path = '/' + urlParts.slice(3).join('/');
        
        // Connect to the server
        if (socket.open(hostname + ':443', 'binary')) {
            // Send HTTPS request
            var request = 'GET ' + path + ' HTTP/1.1\r\n';
            request += 'Host: ' + hostname + '\r\n';
            request += 'Connection: close\r\n\r\n';
            
            socket.write(request);
            
            // Read response
            var response = socket.read();
            if (response) {
                // Find the start of image data (after headers)
                var imageStart = response.indexOf('\r\n\r\n') + 4;
                var imageData = response.substr(imageStart);
                
                // Write to local file
                var file = new File(localPath);
                file.encoding = 'BINARY';
                file.open('w');
                file.write(imageData);
                file.close();
                
                return true;
            }
        }
        socket.close();
    } catch (e) {
        alert('Error downloading image: ' + e);
    }
    return false;
}

if (!jsonFilePath.exists) {
    alert("JSON QUIT FILE not found: " + jsonFilePath.fsName);
}


if (jsonFilePath.exists) {
    try {
        jsonFilePath.open('r');
        var jsonString = jsonFilePath.read();
        jsonFilePath.close();
        var jsonData = parseJSON(jsonString);
        
        if (jsonData) {
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
                "{{Ibis-Mas}}": jsonData.Property.Price.Ibis,
                "{{Property-Url}}": jsonData["Property-Url"]
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
            tableFrame.geometricBounds = textFrame.geometricBounds; 
            var table = tableFrame.insertionPoints[0].tables.add();
            table.columnCount = 1;
            table.bodyRowCount = trueAmenities.length;

            for (var i = 0; i < trueAmenities.length; i++) {
                table.rows[i].cells[0].contents = trueAmenities[i];
            }

            table.columns[0].width = 20;
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
            tableFrame.geometricBounds = textFrame.geometricBounds; 
            var table = tableFrame.insertionPoints[0].tables.add();
            table.columnCount = 2; 
            table.bodyRowCount = keys.length;

            for (var i = 0; i < keys.length; i++) {
                table.rows[i].cells[0].contents = keys[i]; 
                table.rows[i].cells[1].contents = values[i]; 

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
                var imagePath = '';
                if (rectangle.label === "{{Cover-Img}}") {
                    imagePath = placeholderValues["{{Cover-Img}}"];
                } else if (rectangle.label === "{{Index-Cover-Img-First}}" || 
                           rectangle.label === "{{Index-Cover-Img-Second}}") {
                    imagePath = placeholderValues["{{Extra-Img}}"];
                }
                
                if (imagePath) {
                    // Check if it's a URL
                    if (imagePath.indexOf('//images.ctfassets.net/') !== -1) {
                        // Create a local temp file path
                        var tempFile = new File(dirPath + '/' + rectangle.label.replace(/[{}]/g, '') + '.jpg');
                        if (downloadImage(imagePath, tempFile.fsName)) {
                            rectangle.place(tempFile);
                            rectangle.fit(FitOptions.CONTENT_AWARE_FIT);
                            // Clean up temp file
                            tempFile.remove();
                        }
                    } else {
                        // Handle local files as before
                        rectangle.place(File(imagePath));
                        rectangle.fit(FitOptions.CONTENT_AWARE_FIT);
                    }
                }
            }
        }
    }

    const propertyUrl = placeholderValues["{{Title}}"];
    var outputFilePath = dirPath + "/fichas-stash/ficha-" + propertyUrl + ".indd";
    doc.save(new File(outputFilePath));
    doc.close(SaveOptions.NO);

    alert("Ficha GOOD " + outputFilePath);
} else {
    alert("Ficha NO GOOD");
    app.exit();
}

