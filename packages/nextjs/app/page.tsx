"use client";

import type { NextPage } from "next";
import { Bridge } from "~~/components/Bridge";
import { SwapBase } from "~~/components/SwapBase";
import { SwapSolana } from "~~/components/SwapSolana";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-6xl">
        <h1 className="text-center mb-10">
          <span className="block text-4xl font-bold">Cross-Chain Payments</span>
          <span className="block text-xl mt-2">Swap & Bridge USDC between Base and Solana</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-items-center">
          <div className="flex flex-col gap-8 w-full items-center">
            <SwapBase />
            <Bridge />
          </div>

          <div className="flex flex-col gap-8 w-full items-center">
            <SwapSolana />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
