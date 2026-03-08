"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { initWalletConnect } from "../lib/walletconnect";
import { isMobile, walletConnectUriToDeepLink } from "../lib/deeplink";

const CONTRACT = "0x9F8C29E496ECB6C39c221458f211234DfCB233E0";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function connect() {
    setStatus("Initializing WalletConnect...");

    const wcProvider = await initWalletConnect();

    // WalletConnect v2 provider emits a `display_uri` event with the wc: URI
    wcProvider.on("display_uri", (uri: string) => {
      if (isMobile()) {
        const deepLink = walletConnectUriToDeepLink(uri, "metamask");
        window.location.href = deepLink;
      } else {
        // Desktop: show the URI as a QR code in your UI (recommended)
        // For now we just display the URI so you can plug it into a QR component.
        setStatus(`WalletConnect URI (show as QR): ${uri}`);
      }
    });

    setStatus("Requesting accounts...");
    await wcProvider.connect();

    const ethersProvider = new ethers.BrowserProvider(wcProvider as any);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    setAddress(userAddress);
    setStatus("Connected.");
  }

  return (
    <main style= maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" >
      <h1>EfikCoin Eternal</h1>
      <p>Contract: <code>{CONTRACT}</code></p>

      <button onClick={connect} style= padding: "10px 14px", borderRadius: 10 >
        Connect Wallet
      </button>

      {address && (
        <p style= marginTop: 12 >
          Connected as: <code>{address}</code>
        </p>
      )}

      {status && (
        <p style= marginTop: 12, opacity: 0.8 >
          {status}
        </p>
      )}

      <hr style= margin: "24px 0"  />

      <h2>Add token to wallet (after connect)</h2>
      <p>
        After connecting, you can call <code>wallet_watchAsset</code> for MetaMask.
        You will need your token <strong>symbol</strong> and <strong>decimals</strong>.
      </p>
    </main>
  );
}
