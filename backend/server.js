require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const db = require('./database');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to BSC
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// Minimal ABI for basic functions
const contractABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// Make available to routes
app.locals.provider = provider;
app.locals.contract = contract;
app.locals.ownerAddress = process.env.OWNER_ADDRESS;

// Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health check (so Render knows it's alive)
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startEventListener();
});

// Listen to Transfer events
function startEventListener() {
    console.log('Listening for Transfer events...');
    contract.on('Transfer', (from, to, value, event) => {
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const timestamp = Math.floor(Date.now() / 1000);

        db.run(
            `INSERT OR IGNORE INTO transactions 
            (tx_hash, from_address, to_address, value, block_number, timestamp, type) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [txHash, from, to, value.toString(), blockNumber, timestamp, 'Transfer'],
            (err) => {
                if (err) console.error('DB insert error:', err);
            }
        );
    });
}
