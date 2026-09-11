const sharp = require('sharp');
const fs = require('fs');

async function processIcon(path) {
    if (!fs.existsSync(path)) {
        console.log(`File not found: ${path}`);
        return;
    }
    
    console.log(`Processing ${path}...`);
    
    try {
        const metadata = await sharp(path).metadata();
        const width = metadata.width;
        const height = metadata.height;
        
        // Scale down to 82%
        const scale = 0.82;
        const newWidth = Math.round(width * scale);
        const newHeight = Math.round(height * scale);
        
        // Resize the image
        const resizedBuffer = await sharp(path)
            .resize(newWidth, newHeight)
            .toBuffer();
        
        // Create a new canvas with the original size and TRANSPARENT background
        await sharp({
            create: {
                width: width,
                height: height,
                channels: metadata.channels || 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .composite([{ input: resizedBuffer, gravity: 'center' }])
        .png()
        .toFile(path + '.temp.png');
        
        fs.renameSync(path + '.temp.png', path);
        console.log(`Successfully processed ${path}`);
    } catch (err) {
        console.error(`Error processing ${path}:`, err);
    }
}

async function run() {
    await processIcon('public/pwa-192x192-trans.png');
    await processIcon('public/pwa-192x192-full-trans.png');
    await processIcon('public/pwa-512x512-trans.png');
    await processIcon('public/pwa-512x512-full-trans.png');
}

run();
