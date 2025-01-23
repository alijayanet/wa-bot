const express = require('express');
const router = express.Router();
const db = require('../database'); // Sesuaikan dengan koneksi database Anda

router.post('/login', async (req, res) => {
  try {
    const { deviceId, phoneNumber } = req.body;
    
    // Query ke database untuk validasi
    const user = await db.query(
      'SELECT * FROM clients WHERE device_id = ? OR phone_number = ?',
      [deviceId, phoneNumber]
    );

    if (user.length > 0) {
      // Buat session token
      const token = generateToken(user[0]);
      res.json({
        success: true,
        token,
        user: {
          id: user[0].id,
          deviceId: user[0].device_id,
          phoneNumber: user[0].phone_number
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Device ID atau nomor telepon tidak ditemukan'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router; 