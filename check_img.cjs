const sharp = require('sharp');
async function run() {
  const meta = await sharp('public/155-uasu-baf-logo.png').metadata();
  console.log('Original dimensions:', meta.width, 'x', meta.height, meta.channels, 'channels');
}
run();
