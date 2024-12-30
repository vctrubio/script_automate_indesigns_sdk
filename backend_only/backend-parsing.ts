import { Entry, Asset } from 'contentful';
import { Property } from './backend-types';

function ImageToUrl(entry: any): string {
    const url = entry.fields.file.url.startsWith('http') ? entry.fields.file.url : `https:${entry.fields.file.url}`;
    return url;
}

function extractImageUrls(entries: any[]): string[] {
    return entries.map(entry => ImageToUrl(entry));
}

function getRoomPhotoUrl(entries: any[]): string[] {
    const urls = entries.map(entry => {
        const photos = entry.fields.photos
        const it = photos ? extractImageUrls(photos) : []
        return it
    }
    )
    return urls.flat()
}

export function parsePropertyFromContentful({ entry }: { entry: any }): Property | null {
    if (!entry.fields) {
        console.log('no field for entry', entry)
        return null
    }
    
    const { barrioRef, amentetiesRef, characteristics, habitacionesPaginas, ibi, maintenanceCostMonthly, photos, plano, title, description, buyOrRent, reformado, precio, url } = entry.fields;
    const coverUrl = photos ? extractImageUrls(photos)[0] : null;
    const planoUrl = plano ? ImageToUrl(plano) : null;

    return {
        title: title,
        url: url,
        description: description,
        buyOrRent: buyOrRent,
        reformado: reformado,
        precio: precio,
        precioIbi: ibi ?? 0,
        precioComunidad: maintenanceCostMonthly ?? 0,
        plano_url: planoUrl ?? null,
        cover_url: coverUrl ? [coverUrl] : [],
        barrioRef: barrioRef?.fields ?? null,
        amentitiesRef: amentetiesRef?.fields ?? null,
        charRef: characteristics?.fields ?? null,
        roomsRef: entry.fields.habitacionesPaginas?.map((h: Entry<any>) => ({
            title: h.fields.title,
            description: h.fields.description,
            photos: (h.fields.photos as Asset<any>[])?.map(photo => photo.fields.file?.url) ?? []
        })) ?? null,

        photos_url: [
            ...(photos ? extractImageUrls(photos) : []),
            // ...(habitacionesPaginas ? getRoomPhotoUrl(habitacionesPaginas) : []),
            // ...(planoUrl ? [planoUrl] : [])
        ],
    } as Property;
}