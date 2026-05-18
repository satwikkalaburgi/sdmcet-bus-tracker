import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stops: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  optimizedPath: [{ // AI suggested path points
    lat: Number,
    lng: Number
  }]
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);
export default Route;
