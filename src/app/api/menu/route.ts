import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/Mongodb';
import MenuItem from '@/models/MenuItem';

// 1. GET Request: Database se saare menu items lane ke liye
export async function GET() {
  try {
    await connectToDatabase();
    const items = await MenuItem.find({}); // DB se sab kuch utha lo
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

// 2. POST Request: Naya menu item database mein save karne ke liye
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json(); // Frontend se aaya hua data
    
    // Database mein naya record create karna
    const newItem = await MenuItem.create(body); 
    
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Item add nahi hua" }, { status: 500 });
  }
}

// 3. DELETE Request: Item ko hamesha ke liye delete karna
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // URL se ID nikalenge
    
    await connectToDatabase();
    await MenuItem.findByIdAndDelete(id); // MongoDB se delete
    
    return NextResponse.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting" }, { status: 500 });
  }
}

// 4. PUT Request: Item ka status (In Stock / Out of Stock) update karna
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json(); // Frontend se naya status aayega
    
    await connectToDatabase();
    await MenuItem.findByIdAndUpdate(id, body); // MongoDB mein update
    
    return NextResponse.json({ success: true, message: "Item updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating" }, { status: 500 });
  }
}