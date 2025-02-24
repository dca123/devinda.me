import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'fs'

const convert = (folder: string, fileName: string, quality: number) => {
    console.log('converting file' + fileName + " with quality " + quality)
    const image = sharp(folder + "/" + fileName);
    image.jpeg({
        quality
    }).toFile(folder + '/optimized/' + fileName, (err, info) => {
        if (err) {
            console.error(err + ' ' + fileName)
        } else {
            console.log(info.size + ' bytes')
            if (info.size > 1e+7) {
                convert(folder, fileName, quality - 1)
            } else {
                console.log('converted file' + fileName)
            }

        }
    })
}

const folder = Bun.argv[2]
if (folder === undefined) {
    throw new Error('Please provide a folder name')
}
if (!existsSync(folder + '/optimized')) {
    mkdirSync(folder + '/optimized');

}
var files = readdirSync(folder, {
    withFileTypes: true
})
.filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.jpeg'))
.map(file => file.name);

for (const file of files) {
    convert(folder, file, 100)
}


