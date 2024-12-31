// Mock the File object and other Adobe-specific functionality
const fs = require('fs');
const path = require('path');

const dirPath = path.resolve(__dirname, '..');

function File(path) {
    return {
        exists: fs.existsSync(path),
        open: function(mode) { return true; },
        read: function() {
            return fs.readFileSync(path, 'utf8');
        },
        close: function() { return true; },
        fsName: path
    };
}

// Import the functions we want to test
function getPropertyById(propertyUrl) {
    try {
        const propertiesData = JSON.parse(fs.readFileSync(path.join(dirPath, 'json-data/properties-data.json'), 'utf8'));
        
        if (!propertiesData || !propertiesData.properties) {
            throw new Error("Invalid properties data");
        }

        const property = propertiesData.properties.find(p => p["Property-Url"] === propertyUrl);
        
        if (!property) {
            console.log("Property not found with URL: " + propertyUrl);
            return null;
        }

        return {
            "{{Title}}": property.Property.Title,
            "{{Cover-Img}}": property["Cover-Img"][0], // Using first image instead of placeholder
            "{{Extra-Img}}": property.Habitaciones-Paginas?.[0]?.Photos?.[0] || "", // Using first room photo if available
            "{{Amentities}}": property.Amentities || {},
            "{{Description}}": property.Property.Description,
            "{{Characteristics}}": property.Characteristics,
            "{{Precio}}": property.Property.Price.Price,
            "{{Ibis-Mas}}": property.Property.Price.Ibis,
            "{{Property-Url}}": property["Property-Url"]
        };
    } catch (e) {
        console.error("Error reading or parsing properties file:", e.message);
        return null;
    }
}

function getAllProperties() {
    try {
        const propertiesData = JSON.parse(fs.readFileSync(path.join(dirPath, 'json-data/properties-data.json'), 'utf8'));

        if (!propertiesData || !propertiesData.properties) {
            throw new Error("Invalid properties data");
        }

        return propertiesData.properties.map(property => ({
            "{{Title}}": property.Property.Title,
            "{{Cover-Img}}": property["Cover-Img"][0], // Using first image instead of placeholder
            "{{Extra-Img}}": property.Habitaciones-Paginas?.[0]?.Photos?.[0] || "", // Using first room photo if available
            "{{Amentities}}": property.Amentities || {},
            "{{Description}}": property.Property.Description,
            "{{Characteristics}}": property.Characteristics,
            "{{Precio}}": property.Property.Price.Price,
            "{{Ibis-Mas}}": property.Property.Price.Ibis,
            "{{Property-Url}}": property["Property-Url"]
        }));
    } catch (e) {
        console.error("Error reading or parsing properties file:", e.message);
        return [];
    }
}

// Export functions for testing
module.exports = {
    getPropertyById,
    getAllProperties
};

// If running directly (not required as a module), show some example usage
if (require.main === module) {
    console.log("Example property (san-mateo):", getPropertyById("san-mateo"));
    console.log("\nAll properties count:", getAllProperties().length);
} 