const express = require('express');
const router = express.Router();
const config = require('../config.json');

router.get('/config', (req, res) => {
    // Kirim hanya data yang diperlukan untuk keamanan
    res.json({
        admin: {
            username: config.admin.username
        }
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === config.admin.username && password === config.admin.password) {
        // Buat session
        req.session.adminLoggedIn = true;
        req.session.adminUsername = username;
        
        res.json({
            success: true,
            message: 'Login berhasil'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Username atau password salah'
        });
    }
});

module.exports = router; 