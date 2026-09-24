import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true }, // Kis table se order aaya hai
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // Status: Pending, Preparing, ya Completed
}, { timestamps: true }); // Exact time save karega ki order kab aaya

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);