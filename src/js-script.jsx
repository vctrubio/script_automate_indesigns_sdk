// Constants
var INDESIGN_SCRIPTS_PATH = "/Users/trtp/Library/Preferences/Adobe InDesign/Version 20.0/en_US/Scripts/Scripts Panel/";
var dirPath = "~/Desktop/indesign_script/";
var filePath = File(dirPath + "Template101.indd");
var jsonFilePath = File(dirPath + "json-data/template-test.json");

var coverImg = "~/Desktop/x-photos/a.jpeg";
var extraImg = "~/Desktop/x-photos/b.jpeg";

// Helper functions
function formatPrice(price) {
    // Convert to number in case it's a string
    var num = Number(price);
    if (isNaN(num)) return "Precio: 0 €";

    // Format with Spanish thousands separator (.) and add € symbol
    var formattedPrice = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return "Precio: " + formattedPrice + " €";
}

function formatIbis(ibis) {
    // Convert to number in case it's a string
    var num = Number(ibis);
    if (isNaN(num) || num === 0) return "";

    // Format with Spanish thousands separator (.) and add € symbol
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

function downloadImage(url, localPath) {
    // not tested
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

function styleTable(table) {
    try {
        // First remove all table borders
        for (var i = 0; i < table.cells.length; i++) {
            var cell = table.cells[i];

            // Clear all borders except bottom
            cell.topEdgeStrokeWeight = "0pt";
            cell.leftEdgeStrokeWeight = "0pt";
            cell.rightEdgeStrokeWeight = "0pt";

            // Add bottom border to each cell
            cell.bottomEdgeStrokeWeight = "0.5pt";
            cell.bottomEdgeStrokeColor = app.activeDocument.swatches.item("Black");
        }
    } catch (e) {
        alert("Warning: Could not apply table styling: " + e.message);
    }
}
// ... existing code ...

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

        styleTable(table);
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

        styleTable(table);
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
                styleImage(rectangle);
                tempFile.remove();
            }
        } else {
            rectangle.place(File(imagePath));
            styleImage(rectangle);
        }
    }
}

function styleImage(rectangle) {
    const borderRadius = '16px';

    rectangle.fit(FitOptions.FILL_PROPORTIONALLY);
    try {
        // Remove any border
        rectangle.strokeWeight = 0; // Set stroke weight to 0
        rectangle.strokeColor = "None"; // Remove stroke color

        rectangle.topLeftCornerOption = CornerOptions.ROUNDED_CORNER;
        rectangle.topRightCornerOption = CornerOptions.ROUNDED_CORNER;
        rectangle.bottomLeftCornerOption = CornerOptions.ROUNDED_CORNER;
        rectangle.bottomRightCornerOption = CornerOptions.ROUNDED_CORNER;

        rectangle.topLeftCornerRadius = borderRadius;
        rectangle.topRightCornerRadius = borderRadius;
        rectangle.bottomLeftCornerRadius = borderRadius;
        rectangle.bottomRightCornerRadius = borderRadius;
    } catch (e) {
        alert("Warning: Could not apply changes to image: " + e.message);
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

function getPropertyById(propertyUrl) {
    if (!jsonFilePath.exists) {
        alert("JSON file not found: " + jsonFilePath.fsName);
        return null;
    }

    try {
        var propertiesFile = File(dirPath + "json-data/properties-data.json");
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
                    "{{Cover-Img}}": coverImg,
                    "{{Extra-Img}}": extraImg,
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

function getAllProperties() {
    if (!jsonFilePath.exists) {
        alert("JSON file not found: " + jsonFilePath.fsName);
        return [];
    }

    try {
        var propertiesFile = File(dirPath + "json-data/properties-data.json");
        propertiesFile.open('r');
        var jsonString = propertiesFile.read();
        propertiesFile.close();
        var jsonData = parseJSON(jsonString);

        if (!jsonData || !jsonData.properties) {
            throw new Error("Invalid properties data");
        }

        var properties = [];
        for (var i = 0; i < jsonData.properties.length; i++) {
            var property = jsonData.properties[i];
            properties.push({
                "{{Title}}": property.Property.Title,
                "{{Cover-Img}}": coverImg,
                "{{Extra-Img}}": extraImg,
                "{{Amentities}}": property.Amentities || {},
                "{{Description}}": property.Property.Description,
                "{{Characteristics}}": property.Characteristics,
                "{{Precio}}": formatPrice(property.Property.Price.Price),
                "{{Ibis-Mas}}": formatIbis(property.Property.Price.Ibis),
                "{{Property-Url}}": property["Property-Url"]
            });
        }
        return properties;
    } catch (e) {
        alert("Error reading or parsing properties file: " + e.message);
        return [];
    }
}

// Modify loadJsonData to use getPropertyById
function loadJsonData() {
    var propertyUrl = "alaya"; // You might want to make this configurable
    return getPropertyById(propertyUrl);
}

function processDocument(doc, placeholderValues) {
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        processTextFrames(page, placeholderValues);
        processImages(page, placeholderValues);
    }
}

function saveAndCloseDocument(doc, propertyUrl) {
    // Save InDesign file
    var outputFilePath = dirPath + "/fichas-stash/ficha-" + propertyUrl + ".indd";
    doc.save(new File(outputFilePath));

    // Export PDF
    var pdfPath = dirPath + "/fichas-stash/ficha-" + propertyUrl + ".pdf";
    var pdfFile = new File(pdfPath);

    // PDF export preferences
    var pdfPreset = app.pdfExportPresets.itemByName("[High Quality Print]");
    if (!pdfPreset.isValid) {
        pdfPreset = app.pdfExportPresets[0]; // Use default preset if High Quality not found
    }

    // Export the PDF
    doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, pdfPreset);

    // Close the document
    doc.close(SaveOptions.NO);
    alert("Files saved:\nInDesign: " + outputFilePath + "\nPDF: " + pdfPath);
}

function main() {
    var placeholderValues = loadJsonData();
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
