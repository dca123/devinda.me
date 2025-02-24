import { uploadToCloudinary } from "./cloudinary"
import { createImagePage } from "./notion"

const OPTIMIZED_DIR = process.argv[2]
const ALBUM_NAME = process.argv[3]
const DATABASE_URL = process.argv[4]

if (OPTIMIZED_DIR === undefined) {
    throw new Error('Please provide a folder name')
}
if (ALBUM_NAME === undefined) {
    throw new Error('Please provide an album name')
}
if (DATABASE_URL === undefined) {
    throw new Error('Please provide a database url')
}

const calculateAspectRatio = (width: number, height: number) => {
    if (width > height) {
        return "1.91:1"
    } else if (width < height) {
        return "4:5"
    } 
    return "1:1"
}


async function publish(
    directory: string, 
    albumName: string,
    databaseUrl: string
) {
    console.log('publishing album ' + albumName)
    console.log('uploading files to cloudinary')
    const uploadedFiles = await uploadToCloudinary(directory, albumName)
    console.log('upload complete')

    console.log('creating pages in notion')
    for (const file of uploadedFiles) {
        const aspectRatio = calculateAspectRatio(file.width, file.height)
        createImagePage(file.original_filename, file.secure_url, aspectRatio, databaseUrl)
    }
    console.log('publish complete')
}

publish(
    OPTIMIZED_DIR, 
    ALBUM_NAME,
    DATABASE_URL
)