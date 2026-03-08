import EthereumProvider from "@walletconnect/ethereum-provider";

export async function initWalletConnect() {
  // TODO: Replace with your WalletConnect Cloud Project ID
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

  if (!projectId) throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");

  // TODO: Set chainId(s) for your token’s network.
  // Examples:
  // Ethereum Mainnet: 1
  // BSC: 56
  // Polygon: 137
  const chains = [1];

  const provider = await EthereumProvider.init({
    projectId,
    chains,
    showQrModal: false, // we will handle deep link + optional QR UI ourselves
    methods: [
      "eth_requestAccounts",
      "eth_sendTransaction",
      "personal_sign",
      "eth_signTypedData",
      "eth_signTypedData_v4",
    ],
    events: ["accountsChanged", "chainChanged", "disconnect"],
    optionalChains: chains,
  });

  return provider;
}
