import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/Mongodb';
import Order from '@/models/Order';

// 1. GET Request: Admin ko saare orders dikhane ke liye
export async function GET() {
  try {
    await connectToDatabase();
    // sort({ createdAt: -1 }) ka matlab naye orders sabse upar dikhenge
    const orders = await Order.find({}).sort({ createdAt: -1 }); 
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching orders" }, { status: 500 });
  }
}

// 2. POST Request: Jab customer order place karega tab ye chalega
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json(); 
    
    const newOrder = await Order.create(body); 
    
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error creating order" }, { status: 500 });
  }
}

// 3. PUT Request: Order ka status update karne ke liye (Pending -> Completed)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json(); 
    
    await connectToDatabase();
    await Order.findByIdAndUpdate(id, body); 
    
    return NextResponse.json({ success: true, message: "Order status updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating order" }, { status: 500 });
  }
}

// 4. DELETE Request: Order ko hamesha ke liye delete karna
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    await connectToDatabase();
    await Order.findByIdAndDelete(id); 
    
    return NextResponse.json({ success: true, message: "Order deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting order" }, { status: 500 });
  }
}