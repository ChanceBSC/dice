"use client";

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Toaster } from "react-hot-toast";

// export const metadata = {
//   title: "Chance Dice",
//   description: "Chance Dice",
// };

const activeChain = "binance-testnet";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider activeChain={activeChain}>
          {children}
          <Toaster></Toaster>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
