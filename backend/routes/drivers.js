const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../models/database');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/drivers - Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const drivers = await query('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    const driver = drivers[0];

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to get driver' });
  }
});

// POST /api/drivers - Create new driver
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, license_number, status = 'active' } = req.body;

    if (!name || !email || !phone || !license_number) {
      return res.status(400).json({ error: 'Name, email, phone, and license number are required' });
    }

    // Check if email already exists
    const existingEmails = await query('SELECT id FROM drivers WHERE email = ?', [email]);
    if (existingEmails.length > 0) {
      return res.status(409).json({ error: 'Driver with this email already exists' });
    }

    // Check if license number already exists
    const existingLicenses = await query('SELECT id FROM drivers WHERE license_number = ?', [license_number]);
    if (existingLicenses.length > 0) {
      return res.status(409).json({ error: 'Driver with this license number already exists' });
    }

    const driverId = uuidv4();
    await query(
      'INSERT INTO drivers (id, name, email, phone, license_number, status) VALUES (?, ?, ?, ?, ?, ?)',
      [driverId, name, email, phone, license_number, status]
    );

    const newDrivers = await query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    res.status(201).json(newDrivers[0]);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// PUT /api/drivers/:id - Update driver
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, license_number, status } = req.body;

    // Check if driver exists
    const existingDrivers = await query('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (existingDrivers.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check if new email conflicts with another driver
    if (email) {
      const conflictingEmails = await query('SELECT id FROM drivers WHERE email = ? AND id != ?', [email, req.params.id]);
      if (conflictingEmails.length > 0) {
        return res.status(409).json({ error: 'Driver with this email already exists' });
      }
    }

    // Check if new license number conflicts with another driver
    if (license_number) {
      const conflictingLicenses = await query('SELECT id FROM drivers WHERE license_number = ? AND id != ?', [license_number, req.params.id]);
      if (conflictingLicenses.length > 0) {
        return res.status(409).json({ error: 'Driver with this license number already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (license_number !== undefined) {
      updates.push('license_number = ?');
      values.push(license_number);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    await query(`UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedDrivers = await query('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    res.json(updatedDrivers[0]);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// DELETE /api/drivers/:id - Delete driver
router.delete('/:id', async (req, res) => {
  try {
    // Check if driver exists
    const existingDrivers = await query('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (existingDrivers.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    await query('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

module.exports = router;
