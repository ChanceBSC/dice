"use client";

import Image from "next/image";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { useState, useEffect } from "react";
import {
  useDisconnect,
  useNetworkMismatch,
  useSwitchChain,
  ConnectWallet,
  useAddress,
  useContract,
  useTokenBalance,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { Goerli, BinanceTestnet, Binance } from "@thirdweb-dev/chains";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback } from "react";

export default function Home() {
  const [betMethod, setBetMethod] = useState(0);
  const [selection1, setSelection1] = useState(0);
  const [selection2, setSelection2] = useState(0);

  const [betAmount, setBetAmount] = useState("");
  const [chosenNumber, setChosenNumber] = useState(5);
  console.log("🚀 ~ file: page.js:33 ~ Home ~ chosenNumber:", chosenNumber);
  const [betUnder, setBetUnder] = useState(false);
  console.log("🚀 ~ file: page.js:36 ~ Home ~ betUnder:", betUnder);

  const [potentialWin, setPotentialWin] = useState("");
  console.log("🚀 ~ file: page.js:38 ~ Home ~ potentialWin:", potentialWin);
  const [multiplier, setMultiplier] = useState(1);
  console.log("🚀 ~ file: page.js:40 ~ Home ~ multiplier:", multiplier);
  const [probability, setProbability] = useState(0.6);
  console.log("🚀 ~ file: page.js:42 ~ Home ~ probability:", probability);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [playerBetDetails, setPlayerBetDetails] = useState({
    address: "",
    betAmount: "",
    chosenNumber: "",
    betUnder: "",
    win: "",
    roll: "",
  });

  //     user: "Hindzak",
  //     date: "November 4,2022",
  //     bet: 148.985,
  //     multiplier: "2.00x",
  //     payout: 297.97,

  const disconnect = useDisconnect();
  const isMismatched = useNetworkMismatch();

  const switchChain = useSwitchChain();

  const address = useAddress();

  const {
    contract: diceContract,
    isLoading: diceIsLoading,
    error: diceError,
  } = useContract(process.env.NEXT_PUBLIC_DICE_CONTRACT);
  console.log("🚀 ~ file: page.js:43 ~ Home ~ diceContract:", diceContract);

  const {
    contract: tokenContract,
    isLoading: contractIsLoading,
    error: contractError,
  } = useContract(process.env.NEXT_PUBLIC_TOKEN_CONTRACT);
  console.log("🚀 ~ file: page.js:57 ~ Home ~ tokenContract:", tokenContract);

  const { data: totalProfit } = useContractRead(diceContract, "totalProfit");
  const { data: totalLoss } = useContractRead(diceContract, "totalLoss");
  const { data: playerBetCount } = useContractRead(
    diceContract,
    "playerBetCount",
    [address]
  );
  const { data: playerBets } = useContractRead(diceContract, "playerBets", [
    address,
    0,
  ]);
  const { data: maxPayoutMultiplier } = useContractRead(
    diceContract,
    "maxPayoutMultiplier"
  );
  console.log(
    "🚀 ~ file: page.js:85 ~ Home ~ maxPayoutMultiplier:",
    maxPayoutMultiplier
  );
  const { data: maxBet } = useContractRead(diceContract, "maxBet");
  console.log("🚀 ~ file: page.js:90 ~ Home ~ maxBet:", maxBet);
  const { data: minBet } = useContractRead(diceContract, "minBet");
  console.log("🚀 ~ file: page.js:92 ~ Home ~ minBet:", minBet);

  console.log("🚀 ~ file: page.js:80 ~ Home ~ totalProfit:", totalProfit);
  console.log("🚀 ~ file: page.js:76 ~ Home ~ totalLoss:", totalLoss);
  console.log(
    "🚀 ~ file: page.js:77 ~ Home ~ playerBetCount:",
    playerBetCount && playerBetCount.toString()
  );
  console.log("🚀 ~ file: page.js:78 ~ Home ~ playerBets:", playerBets);

  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  console.log("🚀 ~ file: page.js:61 ~ Home ~ tokenBalance:", tokenBalance);

  const { mutateAsync: bet, isLoading: betIsLoading } = useContractWrite(
    diceContract,
    "bet"
  );

  const handleIncreaseButton = useCallback(
    (operation) => {
      if (operation === "half") {
        setBetAmount(betAmount / 2);
      } else if (operation === "double") {
        setBetAmount(betAmount * 2);
      }
    },
    [betAmount]
  );

  const handleBetUnder = (event) => {
    setBetUnder(event.target.value === 'true');
  };

  const handleBetAmount = (event) => {
    let num = Number(tokenBalance?.displayValue).toFixed(2);
    if (event.target.value.length > num.length) {
      setBetAmount(Number(tokenBalance?.displayValue).toFixed(2));
      // handleRollNumber(event);
    } else {
      setBetAmount(event.target.value);
      // handleRollNumber(betAmount);
    }
  };

  const handleRollNumber = (event) => {
    const number = event.target.value;
    console.log("🚀 ~ file: page.js:179 ~ handleRollNumber ~ number:", number);

    const minRange = 1;
    const maxRange = 10;

    if (number < minRange || number > maxRange) {
      return null;
    }

    const prob = (maxRange - number + 1) / (maxRange - minRange + 1);
    console.log("🚀 ~ file: page.js:166 ~ handleRollNumber ~ prob:", prob);

    const multi = (maxPayoutMultiplier.toString() / prob).toFixed(2);
    console.log("🚀 ~ file: page.js:168 ~ handleRollNumber ~ multi:", multi);

    const winAmount = (betAmount * multi).toFixed(2);
    console.log(
      "🚀 ~ file: page.js:175 ~ handleRollNumber ~ winAmount:",
      winAmount
    );

    setChosenNumber(number);
    setProbability(prob);
    setMultiplier(multi);
    setPotentialWin(winAmount);
  };

  async function placeBet() {
    try {
      const data = await bet({
        args: [betAmount, chosenNumber, betUnder],
      });
      console.log("contract call success", data);
    } catch (e) {
      console.error("contract call failure", err);
    }
  }

  async function readData() {
    try {
      // const houseEdgePercentData = await diceContract?.call(
      //   "houseEdgePercent",
      //   [address]
      // );
      const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (const key of keys) {
        try {
          const details = await diceContract?.call("playerBets", [
            address,
            key,
          ]);
          console.log("🚀 ~ file: page.js:201 ~ readData ~ details:", details)
          console.log("display details", key);
          setPlayerBetDetails(details);
        } catch (e) {
          console.error("🚀 ~ file: page.js:128 ~ readData ~ e:", e);
        }
      }
    } catch (e) {
      console.log("error reading data", e);
    }
  }

  useEffect(() => {
    const winAmount = (betAmount * multiplier).toFixed(2);
    console.log("🚀 ~ file: page.js:213 ~ useEffect ~ winAmount:", winAmount);
    setPotentialWin(winAmount);
  }, [betAmount, chosenNumber, multiplier, probability]);

  useEffect(() => {
    readData();
  }, [diceContract, address]);

  useEffect(() => {
    readData();
  }, [diceContract, address]);

  const bigWins = [
    {
      rank: 1,
      user: "Hindzak",
      date: "November 4,2022",
      bet: 148.985,
      multiplier: "2.00x",
      payout: 297.97,
    },
    {
      rank: 2,
      user: "ASKD",
      date: "August 6,2022",
      bet: 207.985,
      multiplier: "2.00x",
      payout: 414.97,
    },
    {
      rank: 3,
      user: "sdfw",
      date: "February 4,2023",
      bet: 124.985,
      multiplier: "2.00x",
      payout: 248.97,
    },
  ];

  const allBets = [
    {
      user: "Hindzak",
      date: "November 4,2022",
      bet: 148.985,
      multiplier: "2.00x",
      payout: 297.97,
    },
    {
      user: "ASKD",
      date: "August 6,2022",
      bet: 207.985,
      multiplier: "2.00x",
      payout: 414.97,
    },
    {
      user: "sdfw",
      date: "February 4,2023",
      bet: 124.985,
      multiplier: "2.00x",
      payout: 248.97,
    },
  ];

  const myBets = [];

  return (
    <main className="bg-gray-primary min-h-screen pt-4 ">
      <div className="shadow-xl filter pb-4 px-12  xl:px-64 flex justify-between ">
        <Image
          className=""
          src="./stake.svg"
          alt=""
          width="80"
          height="80"></Image>
        {/* <button className="bg-blue-600 px-3 rounded-lg">
          <div className="text-white "></div>
        </button> */}
        <ConnectWallet />
      </div>

      {/* <div className=" mx-16  xl:mx-64 flex justify-center mt-8">
        <iframe
          width="400"
          height="720"
          frameborder="0"
          allow="clipboard-read *; 
clipboard-write *; web-share *; accelerometer *; autoplay *; camera *; gyroscope *; payment *; geolocation *"
          src="https://flooz.xyz/embed/trade?swapDisabled=false&swapToTokenAddress=0xb2f664c995B913D598A338C021311B5751
dEde0A&swapLockToToken=true&onRampDisabled=true&onRampAsDefault=false&onRampDefaultAmount=200&onRampTokenAddress=bnb&stakeDis
abled=true&network=bsc&lightMode=false&primaryColor=%231b213b&backgroundColor=transparent&roundedCorners=32&padding=32&refId=SzFHxA"></iframe>
      </div> */}

      <div className="md:grid md:grid-cols-8 flex flex-col-reverse mx-12  xl:mx-64 mt-4 ">
        <div className="bg-gray-tertiary px-3 col-span-3 rounded-l-md">
          <div className="grid grid-cols-2 text-white bg-gray-secondary rounded-2xl justify-items-center my-2 p-1">
            <button
              className={` w-full rounded-2xl py-1 ${
                betMethod == 0 ? "bg-gray-btn" : ""
              }`}
              onClick={() => setBetMethod((value) => (value = 0))}>
              Manual
            </button>
            <button
              className={` w-full rounded-2xl py-1 ${
                betMethod == 1 ? "bg-gray-btn" : ""
              }`}
              onClick={() => setBetMethod((value) => (value = 1))}>
              Auto
            </button>
          </div>

          {betMethod == 0 ? (
            <div>
              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Bet Amount</div>
                <div className="text-gray-300 text-xs">$0.00</div>
              </div>

              <div className=" gap-2 mb-2 bg-gray-btn grid grid-cols-6 p-1 rounded-md mt-1">
                <input
                  type="number"
                  className="outline-none px-2 col-span-4 bg-gray-secondary text-white rounded-lg"
                  placeholder={
                    address
                      ? `${Number(tokenBalance?.displayValue).toLocaleString(
                          2
                        )} ${tokenBalance?.symbol}`
                      : "Balance"
                  }
                  value={betAmount}
                  onChange={handleBetAmount}
                />
                <button
                  className="text-white border-r-2 text-sm border-gray-800"
                  onClick={() => handleIncreaseButton("half")}>
                  1/2
                </button>
                <button
                  className="text-white text-sm"
                  onClick={() => handleIncreaseButton("double")}>
                  2x
                </button>
              </div>

              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Profit on Win</div>
                <div className="text-gray-300 text-xs">$0.00</div>
              </div>
              <input
                type="number"
                disabled
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                placeholder="0.000000"
                value={potentialWin}
              />
              <button className="bg-green-500 my-3 w-full rounded-lg py-2">
                Bet
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Bet Amount</div>
                <div className="text-gray-300 text-xs">$1.00</div>
              </div>

              <div className=" gap-2 mb-2 bg-gray-btn grid grid-cols-6 p-1 rounded-md mt-1">
                <input
                  type="number"
                  className="outline-none px-2 col-span-4 bg-gray-secondary text-white rounded-lg"
                />
                <button className="text-white border-r-2 text-sm border-gray-800">
                  1/2
                </button>
                <button className="text-white text-sm">2x</button>
              </div>

              <div className="text-gray-300 text-xs">Number of bets</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
              />

              <div className="text-gray-300 text-xs mt-2">On Win</div>
              <div className="grid grid-cols-6 justify-items-center content-center bg-gray-btn rounded-md p-1">
                <div className="text-white bg-gray-secondary p-2 text-xs rounded-md">
                  Reset
                </div>
                <div className="text-white text-xs col-span-2 p-2">
                  Increase by:
                </div>
                <input
                  type="number"
                  className="outline-none px-2 col-span-3 bg-gray-secondary w-full rounded-md text-white  mt-1"
                />
              </div>

              <div className="text-gray-300 text-xs mt-2">On Loss</div>
              <div className="grid grid-cols-6 justify-items-center content-center bg-gray-btn rounded-md p-1 mb-2">
                <div className="text-white bg-gray-secondary p-2 text-xs rounded-md">
                  Reset
                </div>
                <div className="text-white text-xs col-span-2 p-2">
                  Increase by:
                </div>
                <input
                  type="number"
                  className="outline-none px-2 col-span-3 bg-gray-secondary w-full rounded-md text-white  mt-1"
                />
              </div>

              <div className="text-gray-300 text-xs">Stop on Profit</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
              />

              <div className="text-gray-300 text-xs mt-2">Stop on Loss</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
              />

              <button className="bg-green-500 my-3 w-full rounded-lg py-2">
                Bet
              </button>
            </div>
          )}
        </div>

        <div className="col-span-5 bg-gray-secondary flex flex-col px-10 rounded-r-md">
          <input
            className="my-28 md:my-auto"
            type="range"
            min="0"
            max="10"
            value={chosenNumber}
            step="1"
            onChange={handleRollNumber}
          />
          <div>
            <label>
              <input
                type="radio"
                value="false"
                checked={betUnder === false}
                onChange={handleBetUnder}
              />
              Bet Under (false)
            </label>
            <label>
              <input
                type="radio"
                value="true"
                checked={betUnder === true} 
                onChange={handleBetUnder}
              />
              Bet Under (true)
            </label>
          </div>
          {/* <Slider
            className="my-28 md:my-auto"
            min={0}
            max={10}
            defaultValue={5}
            value={sliderValue}
            onChange={handleRollNumber}
            step={1}
            trackStyle={{ backgroundColor: "red" }}
            handleStyle={{
              borderColor: "blue",
              backgroundColor: "blue",
            }}
            railStyle={{ backgroundColor: "green" }}
          /> */}
          <div className="grid grid-cols-3 flex-wrap bg-gray-tertiary rounded-lg p-3 gap-2 justify-self-end  mt-auto mb-3">
            <div className="flex flex-col ">
              <div className="text-gray-300 text-xs mb-1">Multiplier</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                disabled
                value={multiplier}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-gray-300 text-xs mb-1">Roll Over</div>
              <input
                type="number"
                min="1"
                max="10"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                value={chosenNumber}
                onChange={handleRollNumber}
              />
            </div>

            <div className="flex flex-col">
              <div className="text-gray-300 text-xs mb-1">Win Chance</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                disabled
                value={probability}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-gray-secondary p-4 mt-8 rounded-lg mx-12  xl:mx-64">
        <div className="text-white">Dice</div>
        <div className=" text-white bg-gray-tertiary rounded-2xl justify-items-center my-2 p-1 flex w-56">
          <button
            className={` w-full rounded-2xl py-1 ${
              selection1 == 0 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection1((value) => (value = 0))}>
            Big Wins
          </button>
          <button
            className={` w-full rounded-2xl py-1 ${
              selection1 == 1 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection1((value) => (value = 1))}>
            Description
          </button>
        </div>
        {selection1 == 0 ? (
          <div className="card ">
            <DataTable value={bigWins} tableStyle={{ minWidth: "50rem" }}>
              <Column
                field="rank"
                header="Rank"
                headerClassName="text-gray-300"></Column>
              <Column field="user" header="User"></Column>
              <Column field="date" header="Date"></Column>
              <Column field="bet" header="Bet"></Column>
              <Column field="multiplier" header="Multiplier"></Column>
              <Column field="payout" header="Payout"></Column>
            </DataTable>
          </div>
        ) : (
          <div className="text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua
          </div>
        )}
      </div>

      <div className="flex flex-col  py-4 mt-8 rounded-lg mx-16  xl:mx-64">
        <div className=" text-white bg-gray-tertiary rounded-2xl justify-items-center my-2 p-1 flex w-56">
          <button
            className={` w-full rounded-2xl py-1 ${
              selection2 == 0 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection2((value) => (value = 0))}>
            All Bets
          </button>
          <button
            className={` w-full rounded-2xl py-1 ${
              selection2 == 1 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection2((value) => (value = 1))}>
            My Bets
          </button>
        </div>
        {selection2 == 0 ? (
          <div className="card ">
            <DataTable
              value={allBets}
              tableStyle={{ minWidth: "50rem" }}
              rows={10}
              paginator
              rowsPerPageOptions={[10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No Bets found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
              <Column field="user" header="User"></Column>
              <Column field="date" header="Date"></Column>
              <Column field="bet" header="Bet"></Column>
              <Column field="multiplier" header="Multiplier"></Column>
              <Column field="payout" header="Payout"></Column>
            </DataTable>
          </div>
        ) : (
          <DataTable
            value={myBets}
            tableStyle={{ minWidth: "50rem" }}
            rows={10}
            paginator
            rowsPerPageOptions={[10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            emptyMessage="No Bets found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
            <Column field="date" header="Date"></Column>
            <Column field="bet" header="Bet"></Column>
            <Column field="multiplier" header="Multiplier"></Column>
            <Column field="payout" header="Payout"></Column>
          </DataTable>
        )}
      </div>

      <div className="bg-gray-secondary px-12  xl:px-64 py-16 flex flex-wrap justify-items-center gap-3 mt-16 ">
        <div className="flex flex-[3] flex-col text-gray-300">
          <Image src="/stake.svg" alt="" width="142" height="47"></Image>
          <div className=" text-sm mt-6">Copyright © 2022 Dice Inc.</div>
          <div className=" text-sm mt-2">All rights reserved</div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Image src="/telegram.svg" alt="" width="18" height="18"></Image>
            <Image src="/discord.svg" alt="" width="18" height="18"></Image>
            <Image src="/twitter.svg" alt="" width="18" height="18"></Image>
            <Image src="/youtube.svg" alt="" width="18" height="18"></Image>
            <Image src="/instagram.svg" alt="" width="18" height="18"></Image>
          </div>
        </div>
        <div className="flex flex-1 flex-col text-gray-300 ">
          <div className="font-semibold text-lg text-white">Product</div>
          <div className=" text-sm mt-6">Swap</div>
          <div className=" text-sm mt-2">Staking</div>
          <div className=" text-sm mt-2">Farming</div>
          <div className=" text-sm mt-2">Liquidity</div>
          <div className=" text-sm mt-2">NFT</div>
        </div>
        <div className="flex flex-1 flex-col text-gray-300">
          <div className="font-semibold text-lg text-white">Support</div>
          <div className=" text-sm mt-6">FAQ</div>
          <div className=" text-sm mt-2">Discord</div>
          <div className=" text-sm mt-2">Tokenomics</div>
          <div className=" text-sm mt-2">Audits</div>
          <div className=" text-sm mt-2">Apply for Listing</div>
        </div>
        <div className="flex flex-[2] flex-col">
          <div className="font-semibold text-lg mb-6 text-white">
            Stay up to date
          </div>
          <div className="flex">
            <input
              type="text"
              className="bg-gray-600 rounded-lg px-2 placeholder-white outline-none py-1"
              placeholder="Your email address"></input>
          </div>
        </div>
      </div>
    </main>
  );
}
