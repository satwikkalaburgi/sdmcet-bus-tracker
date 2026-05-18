import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['idle', 'active', 'maintenance'], default: 'idle' },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  }
}, { timestamps: true });

const Bus = mongoose.model('Bus', busSchema);
export default Bus;
