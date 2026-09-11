from PIL import Image
import os

def pad_image(path, scale_factor=0.85):
    img = Image.open(path)
    # Convert to RGBA to handle transparency
    img = img.convert("RGBA")
    
    # Calculate new size
    new_w = int(img.width * scale_factor)
    new_h = int(img.height * scale_factor)
    
    # Resize the image
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create a new blank image with the original size
    # Check the top-left pixel to see if it's solid or transparent
    top_left_pixel = img.getpixel((0, 0))
    new_img = Image.new("RGBA", (img.width, img.height), top_left_pixel)
    
    # Calculate position to center the resized image
    paste_x = (img.width - new_w) // 2
    paste_y = (img.height - new_h) // 2
    
    # Paste using alpha channel as mask
    new_img.paste(resized, (paste_x, paste_y), resized)
    
    # Save back
    new_img.save(path)
    print(f"Processed {path}")

icons = [
    "public/pwa-192x192.png",
    "public/pwa-192x192-full.png",
    "public/pwa-512x512.png",
    "public/pwa-512x512-full.png"
]

for icon in icons:
    if os.path.exists(icon):
        pad_image(icon, scale_factor=0.82)
    else:
        print(f"File not found: {icon}")

