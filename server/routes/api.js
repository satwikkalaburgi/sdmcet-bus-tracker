import express from 'express';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import { authenticate, authorize } from './auth.js';

const router = express.Router();

router.get('/buses', authenticate, async (req, res) => {
  try {
    const buses = await Bus.find().populate('driver', 'name').populate('route');
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/routes', authenticate, async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/routes', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const newRoute = await Route.create(req.body);
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/buses/:id/status', authenticate, authorize(['driver', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === 'active') {
      updateData.currentLocation = null; // Reset stale location from past trips
    }
    const bus = await Bus.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
