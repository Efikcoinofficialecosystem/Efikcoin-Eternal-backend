const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const db = require('../database');

// GET /api/token-info
router.get('/token-info', async (req, res) => {
    try {
        const contract = req.app.locals.contract;
        const [name, symbol, totalSupply, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.totalSupply(),
            contract.decimals()
        ]);
        res.json({
            name,
            symbol,
            totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
            decimals
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/balance/:address
router.get('/balance/:address', async (req, res) => {
    try {
        const address = ethers.utils.getAddress(req.params.address);
        const contract = req.app.locals.contract;
        const provider = req.app.locals.provider;
        const decimals = await contract.decimals();
        const eceBalance = await contract.balanceOf(address);
        const bnbBalance = await provider.getBalance(address);
        res.json({
            ece: ethers.utils.formatUnits(eceBalance, decimals),
            bnb: ethers.utils.formatEther(bnbBalance)
        });
    } catch (err) {
        res.status(400).json({ error: 'Invalid address' });
    }
});

// GET /api/transactions/:address?
router.get('/transactions/:address?', (req, res) => {
    const address = req.params.address;
    let query = `SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 50`;
    let params = [];
    if (address) {
        query = `SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY timestamp DESC LIMIT 50`;
        params = [address, address];
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
