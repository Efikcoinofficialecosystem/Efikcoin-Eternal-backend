// Configuration
const API_BASE = window.location.origin; // Assumes backend serves frontend
let provider, signer, userAddress;
let isOwner = false;

// DOM elements
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const userInfo = document.getElementById('userInfo');
const userAddressSpan = document.getElementById('userAddress');
const userBalanceSpan = document.getElementById('userBalance');
const bnbBalanceSpan = document.getElementById('bnbBalance');
const adminPanel = document.getElementById('adminPanel');

// Connect wallet
connectBtn.addEventListener('click', async () => {
    if (!window.ethereum) {
        alert('Please install MetaMask or another Web3 wallet.');
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        connectionStatus.innerHTML = '🟢 Connected';
        userAddressSpan.textContent = userAddress;
        userInfo.classList.remove('hidden');
        
        // Check network
        const network = await provider.getNetwork();
        if (network.chainId !== 56) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }]
                });
            } catch (e) {
                if (e.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'BNB Smart Chain',
                            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                            rpcUrls: ['https://bsc-dataseed.binance.org/']
                        }]
                    });
                }
            }
        }
        
        // Fetch balances
        fetchBalances();
        // Check if owner
        const ownerRes = await fetch(`${API_BASE}/api/admin/owner`);
        const ownerData = await ownerRes.json();
        isOwner = (userAddress.toLowerCase() === ownerData.owner.toLowerCase());
        if (isOwner) adminPanel.classList.remove('hidden');
        
        // Setup listeners
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) disconnect();
            else window.location.reload();
        });
    } catch (error) {
        console.error(error);
    }
});

async function fetchBalances() {
    const res = await fetch(`${API_BASE}/api/balance/${userAddress}`);
    const data = await res.json();
    userBalanceSpan.textContent = data.ece + ' ECE';
    bnbBalanceSpan.textContent = data.bnb + ' BNB';
}

// Admin functions
document.getElementById('adminMint').addEventListener('click', async () => {
    const to = prompt('Recipient address:');
    const amount = prompt('Amount:');
    if (!to || !amount) return;
    // Sign a message to prove ownership
    const message = `Mint ${amount} ECE to ${to}`;
    const signature = await signer.signMessage(message);
    const res = await fetch(`${API_BASE}/api/admin/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature, message, to, amount })
    });
    const data = await res.json();
    if (data.success) alert('Mint successful! TX: ' + data.txHash);
    else alert('Error: ' + data.error);
});

// Similar for other admin actions...

// Load initial token info
fetch(`${API_BASE}/api/token-info`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('totalSupply').textContent = data.totalSupply;
    });
