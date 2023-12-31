"use client";

import Image from "next/image";
import Slider from "rc-slider";
import toast from "react-hot-toast";
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

  const [stopOnProfit, setStopOnProfit] = useState("");
  const [stopOnLoss, setStopOnLoss] = useState("");

  const [numOfBet, setNumOfBet] = useState(2);
  const [increaseOnProfit, setIncreaseOnProfit] = useState(0);
  const [increaseOnLoss, setIncreaseOnLoss] = useState(0);

  const [depositAmount, setDepositAmount] = useState("");
  console.log("🚀 ~ file: page.js:53 ~ Home ~ depositAmount:", depositAmount);
  console.log(
    "🚀 ~ file: page.js:54 ~ Home ~ depositAmount:",
    depositAmount && ethers.utils.parseEther(depositAmount).toString()
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  console.log("🚀 ~ file: page.js:55 ~ Home ~ withdrawAmount:", withdrawAmount);
  const [playerBetDetails, setPlayerBetDetails] = useState([]);
  console.log(
    "🚀 ~ file: page.js:64 ~ Home ~ playerBetDetails:",
    playerBetDetails
  );

  const [allPlayerBetDetails, setAllPlayerBetDetails] = useState([]);
  console.log(
    "🚀 ~ file: page.js:74 ~ Home ~ allPlayerBetDetails:",
    allPlayerBetDetails
  );

  const [winDetails, setWinDetails] = useState([]);
  const [lossDetails, setLossDetails] = useState([]);

  const disconnect = useDisconnect();
  const isMismatched = useNetworkMismatch();

  const switchChain = useSwitchChain();

  const address = useAddress();
  console.log("🚀 ~ file: page.js:86 ~ Home ~ address:", address);

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

  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  const { data: totalProfit } = useContractRead(diceContract, "totalProfit");
  const { data: totalLoss } = useContractRead(diceContract, "totalLoss");

  const { data: maxPayoutMultiplier } = useContractRead(
    diceContract,
    "maxPayoutMultiplier"
  );
  const { data: maxBet } = useContractRead(diceContract, "maxBet");
  const { data: minBet } = useContractRead(diceContract, "minBet");
  const { data: contractTokenBalance, isLoading: balanceIsLoading } =
    useContractRead(diceContract, "balances", [address]);

  const { data: playerLosses } = useContractRead(diceContract, "playerLosses", [
    address,
  ]);
  const { data: playerWins } = useContractRead(diceContract, "playerWins", [
    address,
  ]);
  const { data: prizePool } = useContractRead(diceContract, "prizePool");
  console.log(
    "🚀 ~ file: page.js:111 ~ Home ~ prizePool:",
    prizePool && prizePool.toString()
  );

  console.log(
    "🚀 ~ file: page.js:85 ~ Home ~ maxPayoutMultiplier:",
    maxPayoutMultiplier
  );
  console.log(
    "🚀 ~ file: page.js:118 ~ Home ~ contractTokenBalance:",
    contractTokenBalance && contractTokenBalance.toString()
  );
  console.log(
    "🚀 ~ file: page.js:92 ~ Home ~ minBet:",
    minBet && minBet.toString()
  );
  console.log(
    "🚀 ~ file: page.js:112 ~ Home ~ maxBet:",
    maxBet && ethers.utils.formatEther(maxBet)
  );
  console.log(
    "🚀 ~ file: page.js:113 ~ Home ~ maxBet:",
    maxBet && maxBet.toString()
  );
  console.log("🚀 ~ file: page.js:80 ~ Home ~ totalProfit:", totalProfit);
  console.log("🚀 ~ file: page.js:76 ~ Home ~ totalLoss:", totalLoss);
  console.log("🚀 ~ file: page.js:61 ~ Home ~ tokenBalance:", tokenBalance);

  const { data: allow } = useContractRead(tokenContract, "allowance", [
    address,
    process.env.NEXT_PUBLIC_DICE_CONTRACT,
  ]);
  console.log(
    "🚀 ~ file: page.js:143 ~ Home ~ allow:",
    allow && allow.toString()
  );

  const { mutateAsync: bet, isLoading: betIsLoading } = useContractWrite(
    diceContract,
    "bet"
  );

  const { mutateAsync: approve, isLoading: approveIsLoading } =
    useContractWrite(tokenContract, "approve");

  const { mutateAsync: autoBet, isLoading: autoBetIsLoading } =
    useContractWrite(diceContract, "autoBet");

  const { mutateAsync: deposit, isLoading: depositIsLoading } =
    useContractWrite(diceContract, "deposit");

  const { mutateAsync: withdraw, isLoading: withdrawIsLoading } =
    useContractWrite(diceContract, "withdraw");

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

  const handleBetAmount = (event) => {
    let format = Number(
      ethers.utils.formatEther(contractTokenBalance)
    ).toLocaleString(2);
    let num = Number(format).toFixed(2);
    if (event.target.value.length > num.length) {
      setBetAmount(
        Number(ethers.utils.formatEther(contractTokenBalance)).toFixed(2)
      );
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

    const multi = (
      maxPayoutMultiplier && maxPayoutMultiplier.toString() / prob
    ).toFixed(2);
    console.log("🚀 ~ file: page.js:168 ~ handleRollNumber ~ multi:", multi);

    const winAmount = (betAmount * multi).toFixed(2);
    console.log(
      "🚀 ~ file: page.js:175 ~ handleRollNumber ~ winAmount:",
      winAmount
    );

    setChosenNumber(number);
    setProbability(prob);
    setMultiplier(multi);
    // setPotentialWin(winAmount);
    calculatePotentialPayout();
  };

  async function calculatePotentialPayout() {
    try {
      const parsedAmount = ethers.utils.parseEther(betAmount);
      const winAmount = await diceContract?.call("calculatePotentialPayout", [
        parsedAmount,
        chosenNumber,
        betUnder,
      ]);
      console.log(
        "🚀 ~ file: page.js:237 ~ calculatePotentialPayout ~ winAmount:",
        winAmount
      );
      setPotentialWin(ethers.utils.formatEther(winAmount));
    } catch (e) {
      console.error("contract call failure", e);
    }
  }

  useEffect(() => {
    calculatePotentialPayout();
  }, [betAmount, multiplier, chosenNumber, betUnder]);

  async function approveFunction() {
    const notification = toast.loading(`Approving`);
    try {
      const data = await approve({
        args: [process.env.NEXT_PUBLIC_DICE_CONTRACT, "100000"],
      });
      // alert("approve done successful");
      toast.success(`Approval Successfully`, {
        id: notification,
      });
      console.log("contract call success", data);
    } catch (e) {
      toast.error(`Whoops ${e.reason}`, {
        id: notification,
      });
      console.error("contract call failure", e);
    }
  }

  async function placeBet() {
    const notification = toast.loading(`Placing Bet`);
    try {
      console.log("place bet");
      const parsedMinBet = ethers.utils.formatEther(minBet);
      const parsedMaxBet = ethers.utils.formatEther(maxBet);
      const parsedAmount = ethers.utils.parseEther(betAmount);

      if (parsedAmount > parsedMaxBet || parsedAmount < parsedMinBet) {
        toast.error(
          `Please enter a valid amount between ${parsedMinBet} and ${parsedMaxBet}`,
          {
            id: notification,
          }
        );
        // alert(
        //   `Please enter a valid amount between ${parsedMinBet} and ${parsedMaxBet}`
        // );
      }
      // if (
      //   betAmount > contractTokenBalance &&
      //   contractTokenBalance.toString().toFixed(2)
      // ) {
      //   alert(
      //     `Insufficient ${
      //       contractTokenBalance &&
      //       Number(
      //         ethers.utils.formatEther(contractTokenBalance)
      //       ).toLocaleString(2)
      //     } to make ${betAmount} BET please deposit more`
      //   );
      // } else {
      const data = await bet({
        args: [parsedAmount.toString(), chosenNumber, betUnder],
      });

      setBetAmount("");
      setChosenNumber(5);
      setPotentialWin("");

      // alert("bet placed successful");
      toast.success(`Bet Placed Successfully`, {
        id: notification,
      });
      console.log("placeBet contract call success", data);
      // }
    } catch (e) {
      toast.error(`Whoops ${e.reason}`, {
        id: notification,
      });
      console.error("contract call failure", e);
      console.error("contract call failure", e.reason);
      // alert(e.reason);
    }
  }

  async function placeAutoBet() {
    const notification = toast.loading(`Placing Bet`);

    try {
      const parsedMinBet = ethers.utils.formatEther(minBet);
      const parsedMaxBet = ethers.utils.formatEther(maxBet);
      const parsedAmount = ethers.utils.parseEther(betAmount);

      if (parsedAmount > parsedMaxBet || parsedAmount < parsedMinBet) {
        toast.error(
          `Please enter a valid amount between ${parsedMinBet} and ${parsedMaxBet}`,
          {
            id: notification,
          }
        );
        // alert(
        //   `Please enter a valid amount between ${parsedMinBet} and ${parsedMaxBet}`
        // );
      }
      const data = await autoBet({
        args: [
          parsedAmount,
          chosenNumber,
          betUnder,
          numOfBet,
          stopOnProfit,
          stopOnLoss,
          increaseOnProfit,
          increaseOnLoss,
        ],
      });

      setBetAmount("");
      setChosenNumber("");
      // setBetUnder(e.target.value === "false");
      setNumOfBets(2);
      setStopOnProfit("");
      setStopOnLoss("");
      setIncreaseOnProfit("");
      setIncreaseOnLoss("");

      // alert("auto bet placed successful");
      toast.success(`Bet Placed Successfully`, {
        id: notification,
      });

      console.log("contract call success", data);
    } catch (e) {
      toast.error(`Whoops ${e.reason}`, {
        id: notification,
      });
      console.error("contract call failure", e);
    }
  }

  async function readAllData() {
    try {
      const limit = 20;
      const limit2 = 10;

      const data = await diceContract?.call("getAllBets", [limit]);

      const transformedData = data
        .map((item) => ({
          betAmount: `${Number(
            ethers.utils.formatEther(item[0])
          ).toLocaleString()} ${tokenBalance?.symbol}`,
          chosenNumber: item[1].toString(),
          roll: item[3].toString(),
          betUnder: item[2].toString() ? "Under" : "True",
          win: item[4].toString() ? "Loss" : "Won",
        }))
        .filter(
          (item) =>
            item.betAmount !== "0" &&
            item.chosenNumber !== "0" &&
            item.roll !== "0"
        )
        .reverse();

      const data2 = await diceContract?.call("getAllBets", [limit2]);

      const winData = data2
        .map((item) => ({
          betAmount: `${Number(
            ethers.utils.formatEther(item[0])
          ).toLocaleString()} ${tokenBalance?.symbol}`,
          chosenNumber: item[1].toString(),
          roll: item[3].toString(),
          betUnder: item[2].toString() ? "Under" : "True",
          win: item[4].toString() ? "Loss" : "Won",
        }))
        .filter(
          (item) =>
            item.betAmount !== "0" &&
            item.chosenNumber !== "0" &&
            item.roll !== "0" &&
            item.win !== "Loss"
        )
        .reverse();
      console.log("🚀 ~ file: page.js:421 ~ readAllData ~ winData:", winData);

      const lossData = data2
        .map((item) => ({
          betAmount: `${Number(
            ethers.utils.formatEther(item[0])
          ).toLocaleString()} ${tokenBalance?.symbol}`,
          chosenNumber: item[1].toString(),
          roll: item[3].toString(),
          betUnder: item[2].toString() ? "Under" : "True",
          win: item[4].toString() ? "Loss" : "Won",
        }))
        .filter(
          (item) =>
            item.betAmount !== "0" &&
            item.chosenNumber !== "0" &&
            item.roll !== "0" &&
            item.win !== "Won"
        )
        .reverse();
      console.log("🚀 ~ file: page.js:438 ~ readAllData ~ lossData:", lossData);

      setAllPlayerBetDetails(transformedData);
      setWinDetails(winData);
      setLossDetails(lossData);

      console.log("data all success", transformedData);
    } catch (e) {
      console.error("error reading data", e);
    }
  }

  async function readData() {
    try {
      const limit = 20;
      const data = await diceContract?.call("getPlayerBets", [address, limit]);

      const transformedData = data
        .map((item) => ({
          betAmount: `${Number(
            ethers.utils.formatEther(item[0])
          ).toLocaleString()} ${tokenBalance?.symbol}`,
          chosenNumber: item[1].toString(),
          roll: item[3].toString(),
          betUnder: item[2].toString() ? "Under" : "True",
          win: item[4].toString() ? "Loss" : "Won",
        }))
        .filter(
          (item) =>
            item.betAmount !== "0" &&
            item.chosenNumber !== "0" &&
            item.roll !== "0"
        )
        .reverse();

      setPlayerBetDetails(transformedData);
      console.log("data indiviual success", transformedData);
    } catch (e) {
      console.error("error reading data", e);
    }
  }

  async function callDeposit() {
    try {
      const parsedDepositAmount = ethers.utils.parseEther(depositAmount);
      console.log(
        "🚀 ~ file: page.js:370 ~ callDeposit ~ parsedDepositAmount:",
        parsedDepositAmount && parsedDepositAmount.toLocaleString()
      );

      if (depositAmount === "") {
        return;
      } else {
        const parsedAmount = ethers.utils.parseEther(depositAmount);
        const data = await deposit({
          args: [parsedAmount],
        });
        setDepositAmount("");
        alert("deposit successful");
        console.info("deposit contract call success", data);
      }
    } catch (e) {
      console.error("contract call failure", e);
    }
  }

  async function callWithdraw() {
    try {
      const parsedWithdrawAmount = ethers.utils.parseEther(withdrawAmount);
      if (withdrawAmount === "") {
        return;
      } else {
        const data = await withdraw({
          args: [parsedWithdrawAmount],
        });
        setWithdrawAmount("");
        alert("withdrawal successful");
        console.info("withdraw contract call success", data);
      }
    } catch (e) {
      console.error("contract call failure", e);
    }
  }

  const handleBetAmountChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
    const formattedValue = Number(inputValue).toLocaleString(); // Format the value with commas

    let maxWithdrawAmount = "";
    if (contractTokenBalance) {
      maxWithdrawAmount = ethers.utils.formatEther(contractTokenBalance);
    }

    if (inputValue > maxWithdrawAmount) {
      setBetAmount(maxWithdrawAmount);
    } else {
      setBetAmount(inputValue);
    }

    e.target.value = formattedValue;
  };

  useEffect(() => {
    const minRange = 1;
    const maxRange = 10;

    if (chosenNumber < minRange || chosenNumber > maxRange) {
      return null;
    }

    const prob = (maxRange - chosenNumber + 1) / (maxRange - minRange + 1);
    setProbability(prob);
  }, [betAmount, chosenNumber, multiplier, probability]);

  useEffect(() => {
    readAllData();
  }, [diceContract, address, betAmount, betIsLoading]);

  useEffect(() => {
    readData();
  }, [diceContract, address, betAmount, betIsLoading]);

  useEffect(() => {}, [diceContract, address, tokenContract]);

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
            <button
              className={` w-full rounded-2xl py-1 ${
                betMethod == 2 ? "bg-gray-btn" : ""
              }`}
              onClick={() => setBetMethod((value) => (value = 2))}>
              Swap
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
                      ? `${
                          contractTokenBalance &&
                          Number(
                            ethers.utils.formatEther(contractTokenBalance)
                          ).toLocaleString(2)
                        } ${tokenBalance?.symbol}`
                      : "Balance"
                  }
                  min={0}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}kk
                  // onChange={handleBetAmountChange}
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
              <button
                className="bg-green-500 my-3 w-full rounded-lg py-2"
                disabled={!address || betIsLoading}
                onClick={placeBet}>
                Bet
              </button>
            </div>
          ) : betMethod == 1 ? (
            <div>
              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Bet Amount Auto</div>
                <div className="text-gray-300 text-xs">$1.00</div>
              </div>

              <div className=" gap-2 mb-2 bg-gray-btn grid grid-cols-6 p-1 rounded-md mt-1">
                <input
                  type="number"
                  className="outline-none px-2 col-span-4 bg-gray-secondary text-white rounded-lg"
                  placeholder={
                    address
                      ? `${
                          contractTokenBalance &&
                          Number(
                            ethers.utils.formatEther(contractTokenBalance)
                          ).toLocaleString(2)
                        } ${tokenBalance?.symbol}`
                      : "Balance"
                  }
                  value={betAmount ? betAmount.toLocaleString() : ""}
                  onChange={(e) =>
                    setBetAmount(e.target.value.replace(/,/g, ""))
                  }
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

              <div className="text-gray-300 text-xs">Number of bets</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                placeholder="Number of bets"
                value={numOfBet}
                onChange={(e) => setNumOfBet(parseFloat(e.target.value))}
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
                  placeholder="On Win"
                  value={increaseOnProfit}
                  onChange={(e) =>
                    setIncreaseOnProfit(parseFloat(e.target.value))
                  }
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
                  placeholder="On Loss"
                  value={increaseOnLoss}
                  onChange={(e) =>
                    setIncreaseOnLoss(parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="text-gray-300 text-xs">Stop on Profit</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                placeholder="Stop on Profit"
                value={stopOnProfit}
                onChange={(e) => setStopOnProfit(parseFloat(e.target.value))}
              />

              <div className="text-gray-300 text-xs mt-2">Stop on Loss</div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary w-full rounded-md text-white  mt-1"
                placeholder="Stop on Loss"
                value={stopOnLoss}
                onChange={(e) => setStopOnLoss(parseFloat(e.target.value))}
              />

              <button
                className="bg-green-500 my-3 w-full rounded-lg py-2"
                disabled={!address || autoBetIsLoading}
                onClick={placeAutoBet}>
                Bet
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Deposit to play</div>
                <div className="text-gray-300 text-xs">$0.00</div>
              </div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary text-white rounded-lg"
                disabled={!address || depositIsLoading}
                placeholder={
                  address
                    ? `${Number(tokenBalance?.displayValue).toLocaleString(
                        2
                      )} ${tokenBalance?.symbol}`
                    : "Balance"
                }
                value={depositAmount.toLocaleString()}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              {allow && allow.toString() === "0" ? (
                <>
                  <button
                    className="bg-green-500 my-3 w-full rounded-lg py-2"
                    disabled={approveIsLoading}
                    onClick={approveFunction}>
                    Approve Spending First
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-green-500 my-3 w-full rounded-lg py-2"
                    disabled={!address || depositIsLoading}
                    onClick={callDeposit}>
                    Deposit
                  </button>
                </>
              )}

              <div className="flex justify-between ">
                <div className="text-gray-300 text-xs">Withdraw your wins</div>
                <div className="text-gray-300 text-xs">$0.00</div>
              </div>
              <input
                type="number"
                className="outline-none px-2 col-span-4 bg-gray-secondary text-white rounded-lg"
                disabled={!address || withdrawIsLoading}
                placeholder={`${
                  contractTokenBalance &&
                  Number(
                    ethers.utils.formatEther(contractTokenBalance)
                  ).toLocaleString(2)
                } ${tokenBalance?.symbol}`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button
                className="bg-green-500 my-3 w-full rounded-lg py-2"
                disabled={!address || withdrawIsLoading}
                onClick={callWithdraw}>
                Withdraw
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
                onChange={(e) => setBetUnder(e.target.value === "true")}
              />
              Bet Under (false)
            </label>
            <label>
              <input
                type="radio"
                value="true"
                checked={betUnder === true}
                onChange={(e) => setBetUnder(e.target.value === "true")}
              />
              Bet Under (true)
            </label>
          </div>
          {/* <Slider
            className="my-28 md:my-auto"
            min={0}
            max={10}
            defaultValue={5}
            value={chosenNumber}
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
        <div className="text-white">
          <div>
            <p>Wallet {tokenBalance?.symbol} Balance</p>
            <p>
              {Number(tokenBalance?.displayValue).toLocaleString()}{" "}
              {tokenBalance?.symbol}
            </p>
          </div>
          <br />
          <div>
            <p>Dice {tokenBalance?.symbol} Balance</p>
            <p>
              {contractTokenBalance &&
                Number(
                  ethers.utils.formatEther(contractTokenBalance)
                ).toLocaleString(2)}{" "}
              {tokenBalance?.symbol}
            </p>
          </div>
          <br />
          <div>
            <p>Prize Pool</p>
            <p>
              {prizePool &&
                Number(
                  ethers.utils.formatEther(prizePool)
                ).toLocaleString()}{" "}
              {tokenBalance?.symbol}
            </p>
          </div>
          <br />
          <div>
            <p>Total Bets</p>
            <p></p>
          </div>
          <br />

          <div>
            <p>Bet Won</p>
            <p>{playerWins && Number(playerWins).toLocaleString()}</p>
          </div>
          <br />
          <div>
            <p>Bet Lost</p>
            <p>{playerLosses && Number(playerLosses).toLocaleString()}</p>
          </div>
        </div>
        <br />
        <br />
        <br />
        <div className="text-white">Dice</div>
        <div className=" text-white bg-gray-tertiary rounded-2xl justify-items-center my-2 p-1 flex w-56">
          <button
            className={` w-full rounded-2xl py-1 ${
              selection1 == 0 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection1((value) => (value = 0))}>
            Wins
          </button>
          <button
            className={` w-full rounded-2xl py-1 ${
              selection1 == 1 ? "bg-gray-btn" : ""
            }`}
            onClick={() => setSelection1((value) => (value = 1))}>
            Losses
          </button>
        </div>
        {selection1 == 0 ? (
          <div className="card ">
            <DataTable
              value={winDetails}
              tableStyle={{ minWidth: "50rem" }}
              emptyMessage="No Wins Yet. 🥲">
              <Column
                field="user"
                header="User"
                headerClassName="text-gray-300"></Column>
              <Column field="betAmount" header="Bet Amount"></Column>
              <Column field="chosenNumber" header="Chosen Number"></Column>
              <Column field="roll" header="Roll"></Column>
              <Column field="betUnder" header="Bet Under"></Column>
              <Column field="win" header="Win"></Column>
              <Column field="payout" header="Payout"></Column>
            </DataTable>
          </div>
        ) : (
          <div className="card ">
            <DataTable
              value={lossDetails}
              tableStyle={{ minWidth: "50rem" }}
              emptyMessage="No Loss Yet.">
              <Column
                field="user"
                header="User"
                headerClassName="text-gray-300"></Column>
              <Column field="betAmount" header="Bet Amount"></Column>
              <Column field="chosenNumber" header="Chosen Number"></Column>
              <Column field="roll" header="Roll"></Column>
              <Column field="betUnder" header="Bet Under"></Column>
              <Column field="win" header="Win"></Column>
            </DataTable>
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
              value={allPlayerBetDetails}
              tableStyle={{ minWidth: "50rem" }}
              rows={10}
              paginator
              rowsPerPageOptions={[10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No Bets found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
              <Column field="user" header="User"></Column>
              <Column field="betAmount" header="Bet Amount"></Column>
              <Column field="chosenNumber" header="Chosen Number"></Column>
              <Column field="roll" header="Roll"></Column>
              <Column field="betUnder" header="Bet Under"></Column>
              <Column field="win" header="Win"></Column>
            </DataTable>
          </div>
        ) : (
          <DataTable
            value={playerBetDetails}
            tableStyle={{ minWidth: "50rem" }}
            rows={10}
            paginator
            rowsPerPageOptions={[10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            emptyMessage="No Bets found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
            <Column field="betAmount" header="Bet Amount"></Column>
            <Column field="chosenNumber" header="Chosen Number"></Column>
            <Column field="roll" header="Roll"></Column>
            <Column field="betUnder" header="Bet Under"></Column>
            <Column field="win" header="Win"></Column>
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
