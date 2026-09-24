import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD;

    // Check agar password match karta hai
    if (password === correctPassword) {
      return NextResponse.json({ success: true, message: "Welcome Boss!" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Wrong Password!" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}