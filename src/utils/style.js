#include "config.js"

function styleTable(table) {
    // alert("Styling table..."); // Debug alert
    try {
        // Clear all cell borders first
        for (var i = 0; i < table.cells.length; i++) {
            var cell = table.cells[i];
            cell.topEdgeStrokeWeight = "0pt";
            cell.leftEdgeStrokeWeight = "0pt";
            cell.rightEdgeStrokeWeight = "0pt";
            cell.bottomEdgeStrokeWeight = "0pt";
        }

        // Add bottom border to each row and column border
        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            for (var j = 0; j < row.cells.length; j++) {
                // Add bottom border
                row.cells[j].bottomEdgeStrokeWeight = CONFIG.TABLE_BORDER_WEIGHT;

                // border column middles
                if (j === 0 && row.cells.length > 1) {
                    row.cells[j].rightEdgeStrokeWeight = CONFIG.TABLE_BORDER_WEIGHT;
                }
            }
        }
        // alert("Table styled successfully!"); // Debug alert
    } catch (e) {
        alert("Warning: Could not apply table styling: " + e.message);
    }
}

function styleImage(rectangle) {
    // alert("Styling image..."); // Debug alert
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
        // alert("Image styled successfully!"); // Debug alert
    } catch (e) {
        alert("Warning: Could not apply changes to image: " + e.message);
    }
}

$.global.styleTable = styleTable;
$.global.styleImage = styleImage;
