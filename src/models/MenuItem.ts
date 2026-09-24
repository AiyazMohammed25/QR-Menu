import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Dish ka naam (e.g., Paneer Tikka)
  description: { type: String },          // Dish ki details
  price: { type: Number, required: true },// Kitne ka hai
  imageUrl: { type: String },             // NAYA: Image ka link save karne ke liye
  isAvailable: { type: Boolean, default: true }, // Kya ye abhi stock mein hai? (On/Off switch)
}, { timestamps: true }); // Ye automatic bata dega ki dish kab add/update hui thi

// Agar model pehle se bana hai toh wahi use karo, warna naya banao
export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);