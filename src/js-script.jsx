// Constants
var INDESIGN_SCRIPTS_PATH = "/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel/";
var dirPath = "~/Desktop/indesign_script/";
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

function downloadImage(url, localPath) {
    try {
        var socket = new Socket();
        var urlParts = url.split('/');
        var hostname = urlParts[2];
        var path = '/' + urlParts.slice(3).join('/');

        if (socket.open(hostname + ':443', 'binary')) {
            var request = 'GET ' + path + ' HTTP/1.1\r\nHost: ' + hostname + '\r\nConnection: close\r\n\r\n';
            socket.write(request);

            var response = socket.read();
            if (response) {
                var imageStart = response.indexOf('\r\n\r\n') + 4;
                var imageData = response.substr(imageStart);

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

function createCharacteristicsTable(page, textFrame, characteristics) {
    var keys = [];
    var values = [];
    
    for (var key in characteristics) {
        if (characteristics.hasOwnProperty(key)) {
            keys.push(key);
            values.push(characteristics[key]);
        }
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
        }

        table.columns[0].width = 12;
        table.columns[1].width = 8;
    } else {
        textFrame.contents = "";
    }
}

function createAmenitiesTable(page, textFrame, amenities) {
    var trueAmenities = [];
    for (var key in amenities) {
        if (amenities.hasOwnProperty(key) && amenities[key]) {
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

function processImages(page, placeholderValues) {
    for (var k = 0; k < page.rectangles.length; k++) {
        var rectangle = page.rectangles[k];
        if (!rectangle.label) continue;

        var imagePath = '';
        if (rectangle.label === "{{Cover-Img}}") {
            imagePath = placeholderValues["{{Cover-Img}}"];
        } else if (rectangle.label === "{{Index-Cover-Img-First}}" || 
                   rectangle.label === "{{Index-Cover-Img-Second}}") {
            imagePath = placeholderValues["{{Extra-Img}}"];
        }

        if (!imagePath) continue;

        if (imagePath.indexOf('//images.ctfassets.net/') !== -1) {
            var tempFile = new File(dirPath + '/' + rectangle.label.replace(/[{}]/g, '') + '.jpg');
            if (downloadImage(imagePath, tempFile.fsName)) {
                rectangle.place(tempFile);
                rectangle.fit(FitOptions.CONTENT_AWARE_FIT);
                tempFile.remove();
            }
        } else {
            rectangle.place(File(imagePath));
            rectangle.fit(FitOptions.CONTENT_AWARE_FIT);
        }
    }
}

function processTextFrames(page, placeholderValues) {
    for (var j = 0; j < page.textFrames.length; j++) {
        var textFrame = page.textFrames[j];
        var frameText = textFrame.contents;

        for (var placeholder in placeholderValues) {
            if (placeholderValues.hasOwnProperty(placeholder)) {
                if (frameText.indexOf(placeholder) === -1) continue;

                if (placeholder === "{{Amentities}}") {
                    createAmenitiesTable(page, textFrame, placeholderValues[placeholder]);
                    frameText = frameText.replace(placeholder, "");
                } else if (placeholder === "{{Characteristics}}") {
                    createCharacteristicsTable(page, textFrame, placeholderValues[placeholder]);
                    frameText = frameText.replace(placeholder, "");
                } else {
                    frameText = frameText.replace(placeholder, placeholderValues[placeholder]);
                }
            }
        }
        textFrame.contents = frameText;
    }
}

function loadJsonData() {
    if (!jsonFilePath.exists) {
        alert("JSON QUIT FILE not found: " + jsonFilePath.fsName);
        return null;
    }

    try {
        jsonFilePath.open('r');
        var jsonString = jsonFilePath.read();
        jsonFilePath.close();
        var jsonData = parseJSON(jsonString);

        if (!jsonData) {
            throw new Error("Failed to parse JSON data");
        }

        return {
            "{{Title}}": jsonData.Property.Title,
            "{{Cover-Img}}": tmpPlaceholderValues["{{Cover-Img}}"],
            "{{Extra-Img}}": tmpPlaceholderValues["{{Extra-Img}}"],
            "{{Amentities}}": jsonData.Amentities,
            "{{Description}}": jsonData.Property.Description,
            "{{Characteristics}}": jsonData.Characteristics,
            "{{Precio}}": jsonData.Property.Price.Price,
            "{{Ibis-Mas}}": jsonData.Property.Price.Ibis,
            "{{Property-Url}}": jsonData["Property-Url"]
        };
    } catch (e) {
        alert("Error reading or parsing JSON file: " + e.message);
        return null;
    }
}

function processDocument(doc, placeholderValues) {
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        processTextFrames(page, placeholderValues);
        processImages(page, placeholderValues);
    }
}

function saveAndCloseDocument(doc, propertyUrl) {
    var outputFilePath = dirPath + "/fichas-stash/ficha-" + propertyUrl + ".indd";
    doc.save(new File(outputFilePath));
    doc.close(SaveOptions.NO);
    alert("Ficha GOOD " + outputFilePath);
}

function main() {
    placeholderValues = loadJsonData();
    if (!placeholderValues) {
        app.exit();
        return;
    }

    if (!filePath.exists) {
        alert("Ficha NO GOOD");
        app.exit();
        return;
    }

    var doc = app.open(filePath);
    processDocument(doc, placeholderValues);
    saveAndCloseDocument(doc, placeholderValues["{{Title}}"]);
}

// Run the script
main();
