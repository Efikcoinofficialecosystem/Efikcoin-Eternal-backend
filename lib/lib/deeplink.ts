// Basic mobile deep link patterns. Wallet apps differ; these are common.
// You can extend this list based on the wallets you want to support.

export function isMobile() {
  return typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function walletConnectUriToDeepLink(uri: string, wallet: "metamask" | "trust" = "metamask") {
  const encoded = encodeURIComponent(uri);

  if (wallet === "metamask") {
    // MetaMask deep link (works on many devices)
    return `https://metamask.app.link/wc?uri=${encoded}`;
  }

  // Trust Wallet deep link (commonly used)
  return `https://link.trustwallet.com/wc?uri=${encoded}`;
}
