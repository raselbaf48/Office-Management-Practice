const sharp = require('sharp');
async function run() {
  const meta = await sharp('public/temp_logo.png').metadata();
  console.log('temp_logo dimensions:', meta.width, 'x', meta.height, meta.channels, 'channels');
  const { data } = await sharp('public/temp_logo.png')
            .extract({ left: 0, top: 0, width: 1, height: 1 })
            .raw()
            .toBuffer({ resolveWithObject: true });
  console.log('Top-left pixel:', data);
}
run();
