import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Uploading to Cloudinary (where Compress and Convert to WebP is done)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "store_uploads",
          format: "webp",      // 1. Convert the image to WebP
          quality: "auto",     // 2. The quality of the picture will be auto compressed (the size will be reduced a lot)
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Cloudinary secure_url may show the same old extension (e.g. .jpg), so we change the URL extension to .webp
    let finalUrl = (uploadResult as any).secure_url;
    finalUrl = finalUrl.replace(/\.[^/.]+$/, ".webp");

    return NextResponse.json({ url: finalUrl }, { status: 200 });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}