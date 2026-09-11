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
        
        // Get the background color from top-left pixel
        // We'll extract a 1x1 region
        const { data, info } = await sharp(path)
            .extract({ left: 0, top: 0, width: 1, height: 1 })
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        // data contains rgba (or rgb)
        const bg = { r: data[0], g: data[1], b: data[2], alpha: data.length > 3 ? data[3] / 255 : 1 };
        
        // Resize the image
        const resizedBuffer = await sharp(path)
            .resize(newWidth, newHeight)
            .toBuffer();
        
        // Create a new canvas with the original size and background color
        await sharp({
            create: {
                width: width,
                height: height,
                channels: metadata.channels || 4,
                background: bg
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
    await processIcon('public/pwa-192x192.png');
    await processIcon('public/pwa-192x192-full.png');
    await processIcon('public/pwa-512x512.png');
    await processIcon('public/pwa-512x512-full.png');
    
    // Also might want to process other icon files if present
    await processIcon('public/155-uasu-baf-logo.png');
}

run();
