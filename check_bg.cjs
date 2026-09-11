const sharp = require('sharp');
async function run() {
  const { data, info } = await sharp('public/155-uasu-baf-logo.png')
            .extract({ left: 0, top: 0, width: 1, height: 1 })
            .raw()
            .toBuffer({ resolveWithObject: true });
  console.log('Top-left pixel:', data);
}
run();
