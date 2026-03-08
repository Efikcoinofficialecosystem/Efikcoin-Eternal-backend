const express = require('express');
const router = express.Router();
const db = require('../database');
const { ethers } = require('ethers');

// Get token info
router.get('/token-info', (req, res) => {
    const contract = req.app.locals.contract;
    Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.decimals()
    ]).then(([name, symbol, totalSupply, decimals]) => {
        res.json({
            name,
            symbol,
            totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
            decimals
        });
    }).catch(err => res.status(500).json({ error: err.message }));
});

// Get user balance
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

// Get recent transactions
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

// Get staking info (example – expand based on your contract)
router.get('/staking/:address', (req, res) => {
    // ... implement staking queries
});

module.exports = router;
