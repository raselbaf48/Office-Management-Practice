const sharp = require('sharp');

async function generateIcon(size, filename) {
    const inputPath = 'public/155-uasu-baf-logo.png';
    const outputPath = 'public/' + filename;
    const scale = 1.3;

    try {
        const metadata = await sharp(inputPath).metadata();
        const targetHeight = Math.round(size * scale);
        const targetWidth = Math.round(targetHeight * (metadata.width / metadata.height));
        
        const resizedBuffer = await sharp(inputPath)
            .resize(targetWidth, targetHeight)
            .toBuffer();
            
        const canvasWidth = Math.max(size, targetWidth);
        const canvasHeight = Math.max(size, targetHeight);
        
        const canvasBuffer = await sharp({
            create: {
                width: canvasWidth,
                height: canvasHeight,
                channels: 4,
                background: { r:0, g:0, b:0, alpha:0 }
            }
        })
        .composite([{ input: resizedBuffer, gravity: 'center' }])
        .png()
        .toBuffer();

        const left = Math.max(0, Math.floor((canvasWidth - size) / 2));
        const top = Math.max(0, Math.floor((canvasHeight - size) / 2));

        await sharp(canvasBuffer)
            .extract({ left, top, width: size, height: size })
            .png()
            .toFile(outputPath);
        
        console.log(`Successfully generated ${filename}`);
    } catch(e) {
        console.error(`Error processing ${filename}:`, e);
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
