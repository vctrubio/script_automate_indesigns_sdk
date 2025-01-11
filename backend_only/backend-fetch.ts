import { parsePropertyFromContentful } from "./backend-parsing";
const backendLogic = require('./backend-logic');
const fs = require('fs');
const path = require('path');
//.env located in root directoy. call make fetch instead

function convertToTemplate(property: any) {
  return {
    "Property-Url": property.url,
    "Cover-Img": property.photos_url,
    "Barrio": property.barrioRef?.name || "",
    "Property": {
      "Title": property.title,
      "Description": property.description,
      "Price": {
        "Price": property.precio.toString(),
        "Ibis": property.precioIbi.toString(),
        "Precio Comunidad": property.precioComunidad.toString()
      }
    },
    "Amentities": property.amentitiesRef ? {
      "AC": property.amentitiesRef.ac,
      "Heating": property.amentitiesRef.heating,
      "Rooftop": property.amentitiesRef.rooftop,
      "Furnished": property.amentitiesRef.furnished,
      "Portero": property.amentitiesRef.portero,
      "Trastero": property.amentitiesRef.trastero,
      "Elevator": property.amentitiesRef.elevator,
      "Parking": property.amentitiesRef.parking
    } : {},
    "Characteristics": {
      "Tipo de Propiedad": property.charRef?.tipoDePropiedad || "",
      "Area de Estar": property.charRef?.metrosCuadradros?.toString() || "",
      "Dormitorios": property.charRef?.dormitorios?.toString() || "",
      "Baños": property.charRef?.banos?.toString() || "",
      "Patios": property.charRef?.patio?.toString() || "",
      "Balcones": property.charRef?.balcones?.toString() || ""
    },
    "Habitaciones-Paginas": property.roomsRef ? property.roomsRef.map((room: any) => ({
      "Title": room.title,
      "Description": room.description || "",
      "Photos": room.photos || []
    })) : []
  };
}

async function writeToJson() {
  const properties = await backendLogic.fetchPropertiesContenful();
  console.log('Number of properties:', properties.length);

  const parseProperties = properties.map((entry: any) => {
    if (entry.fields) {
      return parsePropertyFromContentful({ entry });
    }
  });

  // Convert each property to template format
  const formattedProperties = parseProperties.map(convertToTemplate);

  const dataToFile = {
    "date": `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear().toString().slice(2)}`,
    "entity": "properties",
    "length": formattedProperties.length,
    "properties": formattedProperties
  };

  const outputDir = path.join(__dirname, '../data-json');
  const outputPath = path.join(outputDir, 'properties-data.json');

  // Ensure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(dataToFile, null, 2));
  console.log('Data written to properties-data.json');
}

writeToJson();