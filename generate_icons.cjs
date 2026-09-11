const sharp = require('sharp');
const fs = require('fs');

async function generateIcon(size, filename, scale) {
    const inputPath = 'public/155-uasu-baf-logo.png';
    const outputPath = 'public/' + filename;
    
    console.log(`Generating ${filename}...`);
    
    try {
        const metadata = await sharp(inputPath).metadata();
        
        // Calculate new dimensions to fit within size x size, scaled by `scale`
        const targetHeight = Math.round(size * scale);
        const targetWidth = Math.round(targetHeight * (metadata.width / metadata.height));
        
        // Resize the image
        const resizedBuffer = await sharp(inputPath)
            .resize(targetWidth, targetHeight)
            .toBuffer();
        
        // Create a new canvas with transparent background
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .composite([{ input: resizedBuffer, gravity: 'center' }])
        .png()
        .toFile(outputPath);
        
        console.log(`Successfully generated ${filename}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

async function run() {
    const scale = 0.9999; 
    await generateIcon(192, 'pwa-192x192.png', scale);
    await generateIcon(192, 'pwa-192x192-full.png', scale);
    await generateIcon(192, 'pwa-192x192-trans.png', scale);
    await generateIcon(192, 'pwa-192x192-full-trans.png', scale);
    
    await generateIcon(512, 'pwa-512x512.png', scale);
    await generateIcon(512, 'pwa-512x512-full.png', scale);
    await generateIcon(512, 'pwa-512x512-trans.png', scale);
    await generateIcon(512, 'pwa-512x512-full-trans.png', scale);
}

run();
