function run(filePath, fileValues) {
    var doc = app.open(filePath);
    processDocument(doc, fileValues);
    saveAndCloseDocument(doc, fileValues["{{Title}}"]);
}

$.global.run = run