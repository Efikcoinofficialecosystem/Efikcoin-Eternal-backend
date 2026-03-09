const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const db = require('../database');

// Verify signature middleware
async function verifyAdmin(req, res, next) {
    try {
        const { address, signature, message } = req.body;
        if (!address || !signature || !message) {
            return res.status(401).json({ error: 'Missing authentication data' });
        }
        const recovered = ethers.utils.verifyMessage(message, signature);
        if (recovered.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        if (address.toLowerCase() !== req.app.locals.ownerAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        req.adminAddress = address;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Authentication failed' });
    }
}

// GET /api/admin/owner (public)
router.get('/owner', (req, res) => {
    res.json({ owner: req.app.locals.ownerAddress });
});

// POST /api/admin/mint
router.post('/mint', verifyAdmin, async (req, res) => {
    const { to, amount } = req.body;
    // In production, you'd construct and return a transaction for signing
    // For now, we acknowledge
    db.run(`INSERT INTO admin_logs (action, params, timestamp, ip) VALUES (?, ?, ?, ?)`,
        'mint', JSON.stringify({ to, amount }), Date.now(), req.ip);
    res.json({ message: 'Mint instruction received – owner must sign and send transaction' });
});

// POST /api/admin/airdrop
router.post('/airdrop', verifyAdmin, (req, res) => {
    const { recipients, amounts } = req.body;
    db.run(`INSERT INTO admin_logs (action, params, timestamp, ip) VALUES (?, ?, ?, ?)`,
        'airdrop', JSON.stringify({ recipients, amounts }), Date.now(), req.ip);
    res.json({ message: 'Airdrop instruction received' });
});

// POST /api/admin/set-pair
router.post('/set-pair', verifyAdmin, (req, res) => {
    const { pairAddress } = req.body;
    db.run(`INSERT INTO admin_logs (action, params, timestamp, ip) VALUES (?, ?, ?, ?)`,
        'set-pair', JSON.stringify({ pairAddress }), Date.now(), req.ip);
    res.json({ message: 'Set pair instruction received' });
});

// GET /api/admin/logs
router.get('/logs', verifyAdmin, (req, res) => {
    db.all(`SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 100`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
