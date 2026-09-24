import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file, fileName } = body; 

    // ImageKit par upload kar rahe hain
    const response = await imagekit.upload({
      file: file, // Ye base64 format mein image hogi
      fileName: fileName,
    });

    return NextResponse.json({ success: true, url: response.url }, { status: 200 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}