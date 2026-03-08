require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const db = require('./database');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend')); // Serve frontend static files

// Blockchain provider
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const contractABI = [ /* Full ABI from your contract – include all functions */ ];
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

// Make provider and contract available globally
app.locals.provider = provider;
app.locals.contract = contract;
app.locals.ownerAddress = process.env.OWNER_ADDRESS;

// API routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startEventListener();
});

// Listen to blockchain events
function startEventListener() {
    console.log('Listening for Transfer events...');
    contract.on('Transfer', (from, to, value, event) => {
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Save to database
        const stmt = db.prepare(`INSERT OR IGNORE INTO transactions 
            (tx_hash, from_address, to_address, value, block_number, timestamp, type) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(txHash, from, to, value.toString(), blockNumber, timestamp, 'Transfer');
        
        // Update user balances (simplified – in production, fetch actual balance)
        // ... additional logic
    });
}
