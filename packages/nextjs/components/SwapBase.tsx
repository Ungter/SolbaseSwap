"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useWalletClient } from "wagmi";

const KYBERSWAP_API_URL = "https://aggregator-api.kyberswap.com/base/api/v1";

export const SwapBase = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [sellAmount, setSellAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    if (!sellAmount) return;
    setLoading(true);
    try {
      const amountIn = parseUnits(sellAmount, 18).toString();
      const params = new URLSearchParams({
        tokenIn: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
        tokenOut: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        amountIn: amountIn,
      });

      const response = await fetch(`${KYBERSWAP_API_URL}/routes?${params.toString()}`, {
        headers: {
          "x-client-id": process.env.NEXT_PUBLIC_KYBERSWAP_CLIENT_ID || "scaffold-eth-2",
        },
      });

      const data = await response.json();
      if (data.code === 0 && data.data) {
        setQuote(data.data);
      } else {
        console.error("Error fetching quote:", data);
        alert("Failed to fetch quote");
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !walletClient || !address) return;
    try {
      // Build the route
      const buildResponse = await fetch(`${KYBERSWAP_API_URL}/route/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.NEXT_PUBLIC_KYBERSWAP_CLIENT_ID || "scaffold-eth-2",
        },
        body: JSON.stringify({
          routeSummary: quote.routeSummary,
          sender: address,
          recipient: address,
        }),
      });

      const buildData = await buildResponse.json();

      if (buildData.code === 0 && buildData.data) {
        const { data: txData, routerAddress, transactionValue } = buildData.data;

        await walletClient.sendTransaction({
          to: routerAddress,
          data: txData,
          value: BigInt(transactionValue),
          account: address,
          chain: undefined,
        });
        alert("Swap submitted!");
      } else {
        console.error("Error building route:", buildData);
        alert("Failed to build swap transaction");
      }
    } catch (error) {
      console.error("Error executing swap:", error);
      alert("Swap failed");
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Swap on Base (KyberSwap)</h2>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Sell ETH Amount</span>
          </label>
          <input
            type="text"
            placeholder="0.01"
            className="input input-bordered w-full max-w-xs"
            value={sellAmount}
            onChange={e => setSellAmount(e.target.value)}
          />
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary" onClick={fetchQuote} disabled={loading}>
            {loading ? "Fetching..." : "Get Quote"}
          </button>
          {quote && (
            <button className="btn btn-secondary" onClick={executeSwap}>
              Swap
            </button>
          )}
        </div>
        {quote && (
          <div className="mt-4">
            <p>Buy Amount: {quote.routeSummary.amountOutUsd} USD</p>
            <p>Estimated Gas: {quote.routeSummary.gas}</p>
          </div>
        )}
      </div>
    </div>
  );
};
