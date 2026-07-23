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

    // Cloudinary එකට Upload කිරීම (මෙහිදී Compress සහ WebP බවට පත් කිරීම සිදු කරයි)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "store_uploads",
          format: "webp",      // 1. පින්තූරය WebP බවට පත් කරයි
          quality: "auto",     // 2. පින්තූරයේ Quality එක ඔටෝ Compress කරයි (Size එක ගොඩක් අඩු වෙයි)
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Cloudinary secure_url සමහරවිට පරණ extension එකම (e.g. .jpg) පෙන්විය හැක, ඒ නිසා අපි URL එකේ extension එක .webp වලට වෙනස් කරනවා
    let finalUrl = (uploadResult as any).secure_url;
    finalUrl = finalUrl.replace(/\.[^/.]+$/, ".webp");

    return NextResponse.json({ url: finalUrl }, { status: 200 });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}