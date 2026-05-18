import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { seedData } from './utils/seed.js';
import Bus from './models/Bus.js';
import LocationLog from './models/LocationLog.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Socket.io for Real-time GPS
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('driverLocationUpdate', async (data) => {
    // data: { busId, routeId, driverId, lat, lng }
    try {
      if (data.busId) {
        await Bus.findByIdAndUpdate(data.busId, {
          currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() }
        });
        
        // Broadcast to students/admins
        io.emit('busLocationUpdated', data);

        // Log location for AI processing sporadically (e.g. 1 in 10 updates or just save all)
        if (Math.random() < 0.2) {
          await LocationLog.create({
            bus: data.busId,
            route: data.routeId,
            driver: data.driverId,
            lat: data.lat,
            lng: data.lng
          });
        }
      }
    } catch (err) {
      console.error('Socket update error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('No MONGO_URI provided. Starting mongodb-memory-server fallback...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);
    
    await seedData();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
