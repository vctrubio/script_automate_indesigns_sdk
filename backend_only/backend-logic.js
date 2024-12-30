const contentful = require('contentful');
const fs = require('fs');
require('dotenv').config();
const { parsePropertyFromContentful } = require('./backend-parsing.ts');

const client = contentful.createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
});

function createJsonFile(property) {
    const jsonContent = {
        "Property-Url": property.url,
        "Cover-Img": property.cover_url[0],
        "Barrio": property.barrioRef?.name,
        "Property": {
            "Title": property.title,
            "Description": property.description,
            "Price": {
                "Price": property.precio,
                "Ibis": property.precioIbi,
                "Precio Comunidad": property.precioComunidad
            }
        },
        "Amentities": {
            "AC": property.amentitiesRef?.ac ?? false,
            "Heating": property.amentitiesRef?.heating ?? false,
            "Rooftop": property.amentitiesRef?.rooftop ?? false,
            "Furnished": property.amentitiesRef?.furnished ?? false,
            "Portero": property.amentitiesRef?.portero ?? false,
            "Trastero": property.amentitiesRef?.trastero ?? false,
            "Elevator": property.amentitiesRef?.elevator ?? false,
            "Parking": property.amentitiesRef?.parking ?? false
        },
        "Characteristics": {
            "Tipo de Propiedad": property.charRef?.tipoDePropiedad,
            "Area de Estar": property.charRef?.metrosCuadrados,
            "Dormitorios en Suite": property.charRef?.dormitoriosSuite,
            "Dormitorios": property.charRef?.dormitorios,
            "Baños": property.charRef?.banos,
            "Patios": property.charRef?.patio,
            "Balcones": property.charRef?.balcones
        },
        "Habitaciones-Paginas": property.roomsRef?.map(room => ({
            "Title": room.title,
            "Description": room.description,
            "Photos": room.photos
        })) ?? []
    };

    const fileName = `template-${property.title}.json`;
    fs.writeFileSync(fileName, JSON.stringify(jsonContent, null, 2));
    console.log(`File created: ${fileName}`);
}


function debug(properties) {
    properties.forEach(property => {
        if (property) {
            console.log('property--------------', property.title);
        }
    });
}


async function fetchPropertiesContenful() {
    const entries = await client.getEntries();
    if (entries.items.length) {
        console.log('Fetched Entries:', entries.items.length);
    } else {
        console.log('No entries found.');
        return null
    }

    const propiedadEntries = entries.items.filter(entry => entry.sys.contentType.sys.id === 'propiedad');
    console.log('Number of propiedad entries:', propiedadEntries.length);

    return propiedadEntries
}


async function main(){
    try {
        const properties = await fetchPropertiesContenful();
        if (!properties) 
            return 
        
        const result = properties.items.map(entry => {
            if (entry.fields) {
                return parsePropertyFromContentful({ entry });
            }
        });
    
        createJsonFile(result[1]);
    } catch (error) {
        console.error('Error running main():', error);
    }
}

module.exports = {
    fetchPropertiesContenful,
}