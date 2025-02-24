import { v2 as cloudinary } from 'cloudinary'
import { readdirSync } from 'fs';

export const uploadToCloudinary = async (folder: string, albumName: string) => {
    const FOLDER_NAME = 'devinda.me/albums/' + albumName
    var files = readdirSync(folder, {
        withFileTypes: true
    })
        .filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.jpeg'))
        .map(file => file.name);

    return Promise.all(files.map(async file => {
        const uploadedFile = await cloudinary.uploader.upload(folder + "/" + file, {
            resource_type: 'image',
            folder: FOLDER_NAME,
            use_filename: true,
            unique_filename: false,
        });
        console.log('uploaded ' + file)
        return uploadedFile
    }))
}




