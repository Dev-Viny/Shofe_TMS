const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../models/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/trucks - Get all trucks
router.get('/', async (req, res) => {
  try {
    const trucks = await query('SELECT * FROM trucks ORDER BY created_at DESC');
    res.json(trucks);
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({ error: 'Failed to get trucks' });
  }
});

// GET /api/trucks/:id - Get truck by ID
router.get('/:id', async (req, res) => {
  try {
    const trucks = await query('SELECT * FROM trucks WHERE id = ?', [req.params.id]);
    const truck = trucks[0];

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    res.json(truck);
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({ error: 'Failed to get truck' });
  }
});

// POST /api/trucks - Create new truck
router.post('/', async (req, res) => {
  try {
    const { registration_number, make, model, capacity, status = 'available' } = req.body;

    if (!registration_number || !make || !model || !capacity) {
      return res.status(400).json({ error: 'Registration number, make, model, and capacity are required' });
    }

    // Check if registration number already exists
    const existingTrucks = await query('SELECT id FROM trucks WHERE registration_number = ?', [registration_number]);
    if (existingTrucks.length > 0) {
      return res.status(409).json({ error: 'Truck with this registration number already exists' });
    }

    const truckId = uuidv4();
    await query(
      'INSERT INTO trucks (id, registration_number, make, model, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
      [truckId, registration_number, make, model, parseInt(capacity), status]
    );

    const newTrucks = await query('SELECT * FROM trucks WHERE id = ?', [truckId]);
    res.status(201).json(newTrucks[0]);
  } catch (error) {
    console.error('Create truck error:', error);
    res.status(500).json({ error: 'Failed to create truck' });
  }
});

// PUT /api/trucks/:id - Update truck
router.put('/:id', async (req, res) => {
  try {
    const { registration_number, make, model, capacity, status } = req.body;

    // Check if truck exists
    const existingTrucks = await query('SELECT * FROM trucks WHERE id = ?', [req.params.id]);
    if (existingTrucks.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    // Check if new registration number conflicts with another truck
    if (registration_number) {
      const conflictingTrucks = await query('SELECT id FROM trucks WHERE registration_number = ? AND id != ?', [registration_number, req.params.id]);
      if (conflictingTrucks.length > 0) {
        return res.status(409).json({ error: 'Another truck with this registration number already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (registration_number !== undefined) {
      updates.push('registration_number = ?');
      values.push(registration_number);
    }
    if (make !== undefined) {
      updates.push('make = ?');
      values.push(make);
    }
    if (model !== undefined) {
      updates.push('model = ?');
      values.push(model);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(parseInt(capacity));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    await query(`UPDATE trucks SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedTrucks = await query('SELECT * FROM trucks WHERE id = ?', [req.params.id]);
    res.json(updatedTrucks[0]);
  } catch (error) {
    console.error('Update truck error:', error);
    res.status(500).json({ error: 'Failed to update truck' });
  }
});

// DELETE /api/trucks/:id - Delete truck
router.delete('/:id', async (req, res) => {
  try {
    // Check if truck exists
    const existingTrucks = await query('SELECT * FROM trucks WHERE id = ?', [req.params.id]);
    if (existingTrucks.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    await query('DELETE FROM trucks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Truck deleted successfully' });
  } catch (error) {
    console.error('Delete truck error:', error);
    res.status(500).json({ error: 'Failed to delete truck' });
  }
});

module.exports = router;
