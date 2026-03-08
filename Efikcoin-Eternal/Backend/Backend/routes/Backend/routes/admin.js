const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const db = require('../database');

// Middleware to verify admin signature
async function verifyAdmin(req, res, next) {
    try {
        const { address, signature, message } = req.body;
        if (!address || !signature || !message) {
            return res.status(401).json({ error: 'Missing auth data' });
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

// Mint tokens (only owner)
router.post('/mint', verifyAdmin, async (req, res) => {
    try {
        const { to, amount } = req.body;
        const provider = req.app.locals.provider;
        const privateKey = process.env.OWNER_PRIVATE_KEY; // Store securely!
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = req.app.locals.contract.connect(wallet);
        const decimals = await contract.decimals();
        const tx = await contract.mint(to, ethers.utils.parseUnits(amount, decimals));
        await tx.wait();
        
        // Log action
        db.run(`INSERT INTO admin_logs (action, params, timestamp, ip) VALUES (?, ?, ?, ?)`,
            'mint', JSON.stringify({ to, amount }), Date.now(), req.ip);
        
        res.json({ success: true, txHash: tx.hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Airdrop
router.post('/airdrop', verifyAdmin, async (req, res) => {
    // similar to mint but with multiple recipients
});

// Set pair address
router.post('/set-pair', verifyAdmin, async (req, res) => {
    // ...
});

// Get admin logs
router.get('/logs', verifyAdmin, (req, res) => {
    db.all(`SELECT * FROM admin_logs ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
