const sharp = require('sharp');

async function generateIcon(size, filename) {
    const inputPath = 'public/155-uasu-baf-logo.png';
    const outputPath = 'public/' + filename;
    
    console.log(`Restoring ${filename}...`);
    
    try {
        const metadata = await sharp(inputPath).metadata();
        
        // 100% scale - exactly as it was originally
        const scale = 1.0;
        const targetHeight = Math.round(size * scale);
        const targetWidth = Math.round(targetHeight * (metadata.width / metadata.height));
        
        const resizedBuffer = await sharp(inputPath)
            .resize(targetWidth, targetHeight)
            .toBuffer();
        
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
        
        console.log(`Successfully restored ${filename}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

async function run() {
    await generateIcon(192, 'pwa-192x192.png');
    await generateIcon(192, 'pwa-192x192-full.png');
    await generateIcon(192, 'pwa-192x192-trans.png');
    await generateIcon(192, 'pwa-192x192-full-trans.png');
    
    await generateIcon(512, 'pwa-512x512.png');
    await generateIcon(512, 'pwa-512x512-full.png');
    await generateIcon(512, 'pwa-512x512-trans.png');
    await generateIcon(512, 'pwa-512x512-full-trans.png');
}

run();
