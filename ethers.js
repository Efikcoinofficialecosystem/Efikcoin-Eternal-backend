async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
    }
    
    try {
        // Request accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider from MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Optional: also have Infura as backup provider
        const infuraProvider = new ethers.JsonRpcProvider('https://bsc-mainnet.infura.io/v3/2267ad84725542089dbd2af7a16cee99');
        
        // Rest of your code...
    } catch (error) {
        console.error(error);
    }
}
