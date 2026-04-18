const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../models/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/deliveries - Get all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await query(`
      SELECT d.*, 
             t.registration_number as truck_registration,
             dr.name as driver_name
      FROM deliveries d
      LEFT JOIN trucks t ON d.truck_id = t.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      ORDER BY d.created_at DESC
    `);
    res.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Failed to get deliveries' });
  }
});

// GET /api/deliveries/:id - Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const deliveries = await query(`
      SELECT d.*, 
             t.registration_number as truck_registration,
             dr.name as driver_name
      FROM deliveries d
      LEFT JOIN trucks t ON d.truck_id = t.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.id = ?
    `, [req.params.id]);
    
    const delivery = deliveries[0];
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Failed to get delivery' });
  }
});

// POST /api/deliveries - Create new delivery
router.post('/', async (req, res) => {
  try {
    const { order_number, origin, destination, truck_id, driver_id, weight, status = 'pending' } = req.body;

    if (!order_number || !origin || !destination || !truck_id || !driver_id || !weight) {
      return res.status(400).json({
        error: 'Order number, origin, destination, truck, driver, and weight are required'
      });
    }

    // Validate truck exists
    const trucks = await query('SELECT id FROM trucks WHERE id = ?', [truck_id]);
    if (trucks.length === 0) {
      return res.status(400).json({ error: 'Invalid truck ID' });
    }

    // Validate driver exists
    const drivers = await query('SELECT id FROM drivers WHERE id = ?', [driver_id]);
    if (drivers.length === 0) {
      return res.status(400).json({ error: 'Invalid driver ID' });
    }

    // Check if order number already exists
    const existingDeliveries = await query('SELECT id FROM deliveries WHERE order_number = ?', [order_number]);
    if (existingDeliveries.length > 0) {
      return res.status(409).json({ error: 'Delivery with this order number already exists' });
    }

    const deliveryId = uuidv4();
    await query(
      'INSERT INTO deliveries (id, order_number, origin, destination, truck_id, driver_id, weight, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [deliveryId, order_number, origin, destination, truck_id, driver_id, parseInt(weight), status]
    );

    const newDeliveries = await query(`
      SELECT d.*, 
             t.registration_number as truck_registration,
             dr.name as driver_name
      FROM deliveries d
      LEFT JOIN trucks t ON d.truck_id = t.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.id = ?
    `, [deliveryId]);
    
    res.status(201).json(newDeliveries[0]);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

// PUT /api/deliveries/:id - Update delivery
router.put('/:id', async (req, res) => {
  try {
    const { order_number, origin, destination, truck_id, driver_id, weight, status } = req.body;

    // Check if delivery exists
    const existingDeliveries = await query('SELECT * FROM deliveries WHERE id = ?', [req.params.id]);
    if (existingDeliveries.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Validate truck if provided
    if (truck_id) {
      const trucks = await query('SELECT id FROM trucks WHERE id = ?', [truck_id]);
      if (trucks.length === 0) {
        return res.status(400).json({ error: 'Invalid truck ID' });
      }
    }

    // Validate driver if provided
    if (driver_id) {
      const drivers = await query('SELECT id FROM drivers WHERE id = ?', [driver_id]);
      if (drivers.length === 0) {
        return res.status(400).json({ error: 'Invalid driver ID' });
      }
    }

    // Check if new order number conflicts with another delivery
    if (order_number) {
      const conflictingDeliveries = await query('SELECT id FROM deliveries WHERE order_number = ? AND id != ?', [order_number, req.params.id]);
      if (conflictingDeliveries.length > 0) {
        return res.status(409).json({ error: 'Delivery with this order number already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (order_number !== undefined) {
      updates.push('order_number = ?');
      values.push(order_number);
    }
    if (origin !== undefined) {
      updates.push('origin = ?');
      values.push(origin);
    }
    if (destination !== undefined) {
      updates.push('destination = ?');
      values.push(destination);
    }
    if (truck_id !== undefined) {
      updates.push('truck_id = ?');
      values.push(truck_id);
    }
    if (driver_id !== undefined) {
      updates.push('driver_id = ?');
      values.push(driver_id);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(parseInt(weight));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    await query(`UPDATE deliveries SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedDeliveries = await query(`
      SELECT d.*, 
             t.registration_number as truck_registration,
             dr.name as driver_name
      FROM deliveries d
      LEFT JOIN trucks t ON d.truck_id = t.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.id = ?
    `, [req.params.id]);
    
    res.json(updatedDeliveries[0]);
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ error: 'Failed to update delivery' });
  }
});

// PATCH /api/deliveries/:id/status - Update delivery status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if delivery exists
    const existingDeliveries = await query('SELECT * FROM deliveries WHERE id = ?', [req.params.id]);
    if (existingDeliveries.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    await query('UPDATE deliveries SET status = ? WHERE id = ?', [status, req.params.id]);

    const updatedDeliveries = await query(`
      SELECT d.*, 
             t.registration_number as truck_registration,
             dr.name as driver_name
      FROM deliveries d
      LEFT JOIN trucks t ON d.truck_id = t.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.id = ?
    `, [req.params.id]);
    
    res.json(updatedDeliveries[0]);
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// DELETE /api/deliveries/:id - Delete delivery
router.delete('/:id', async (req, res) => {
  try {
    // Check if delivery exists
    const existingDeliveries = await query('SELECT * FROM deliveries WHERE id = ?', [req.params.id]);
    if (existingDeliveries.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    await query('DELETE FROM deliveries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({ error: 'Failed to delete delivery' });
  }
});

module.exports = router;
