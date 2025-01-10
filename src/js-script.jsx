// Import config and getters
#include "./utils/config.js"
#include "./utils/getters.js"
#include "./utils/style.js"
#include "./utils/download.js"

function loadJsonData() {
    var propertyUrl = CONFIG.FICHA;
    return getPropertyById(propertyUrl);
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
            var tempFile = new File(CONFIG.DIR_PATH + '/' + rectangle.label.replace(/[{}]/g, '') + '.jpg');
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

function processDocument(doc, placeholderValues) {
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        processTextFrames(page, placeholderValues);
        processImages(page, placeholderValues);
    }
}

function saveAndCloseDocument(doc, propertyUrl) {
    // Save InDesign file
    var outputFilePath = CONFIG.DIR_PATH + "/fichas-stash/ficha-" + propertyUrl + ".indd";
    doc.save(new File(outputFilePath));

    // Export PDF
    var tmpDir = "/fichas-stash/ficha-"
    var pdfPath = CONFIG.DIR_PATH + tmpDir + propertyUrl + ".pdf";
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

    if (!CONFIG.FILE_PATH.exists) {
        alert("Ficha NO GOOD");
        app.exit();
        return;
    }

    var doc = app.open(CONFIG.FILE_PATH);
    processDocument(doc, placeholderValues);
    saveAndCloseDocument(doc, placeholderValues["{{Title}}"]);
}

main();
