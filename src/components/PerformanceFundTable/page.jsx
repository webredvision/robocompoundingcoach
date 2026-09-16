"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CryptoJS from "crypto-js";
import TopFundskeleton from "../skeletons/topFundskeleton";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function MutualFundTable({ performanceData, schemeName, roboUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [fundList, setFundList] = useState(performanceData);
  const [showInvestPopup, setShowInvestPopup] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pcode, setPcode] = useState("");
  const [title, setTitle] = useState("");
  const [filteredFunds, setFilteredFunds] = useState([]);
  const router = useRouter();

  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

  // Set fund list from performanceData
  useEffect(() => {
    if (performanceData && Array.isArray(performanceData)) {
      setFundList(performanceData);
    }
  }, [performanceData]);

  // Apply search and sorting
  useEffect(() => {
    let result = [...fundList];

    if (searchQuery) {
      result = result.filter((f) =>
        f?.funddes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "fundSize") {
      result.sort((a, b) => b.Corpus - a.Corpus);
    } else if (sortBy === "returns") {
      const getReturnValue = (fund) => {
        return parseFloat(
          fund?.five_year !== "0.00" ? fund.five_year :
            fund?.three_year !== "0.00" ? fund.three_year :
              fund?.one_year !== "0.00" ? fund.one_year :
                fund?.nine_month !== "0.00" ? fund.nine_month :
                  fund?.six_month !== "0.00" ? fund.six_month :
                    fund?.three_month !== "0.00" ? fund.three_month :
                      fund?.one_month !== "0.00" ? fund.one_month :
                        fund?.one_week !== "0.00" ? fund.one_week :
                          "0"
        );
      };

      result.sort((a, b) => getReturnValue(b) - getReturnValue(a));
    } else if (sortBy === "nav") {
      const getNavValue = (fund) => {
        return parseFloat(
          fund?.fiveyear_navEndDate !== "0.00" ? fund.fiveyear_navEndDate :
            fund?.threeyear_navEndDate !== "0.00" ? fund.threeyear_navEndDate :
              fund?.one_year !== "0.00" ? fund.one_year :
                fund?.nine_month !== "0.00" ? fund.nine_month :
                  fund?.six_month !== "0.00" ? fund.six_month :
                    fund?.three_month !== "0.00" ? fund.three_month :
                      fund?.onemonth_navEndDate !== "0.00" ? fund.onemonth_navEndDate :
                        fund?.oneweek_navEndDate !== "0.00" ? fund.oneweek_navEndDate :
                          "0"
        );
      };

      result.sort((a, b) => getNavValue(b) - getNavValue(a));
    }

    setFilteredFunds(result);
  }, [searchQuery, sortBy, fundList]);


  const handleSelectFunds = (fund) => {
    const dataToStore = {
      pcode: fund.pcode,
      ftype: schemeName,
      timestamp: Date.now(),
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(dataToStore),
      SECRET_KEY
    ).toString();

    localStorage.setItem("encryptedFundPerormanceData", encrypted);

    window.location.href = "/performance/fund-performance/fund-details";
  };

  const handleInvestSubmit = async (pcode) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/robo/get-minimum-amount`,
        {
          schemeCode: pcode,
          arn_id: roboUser.ARNID,
        }
      );
      const minAmount = res?.data?.data?.data[pcode] || 0;
      const enteredAmount = parseFloat(investAmount);

      if (!enteredAmount || enteredAmount <= 0) {
        setErrorMessage("Please enter a valid investment amount.");
        return;
      }

      if (enteredAmount < minAmount) {
        setErrorMessage(`Minimum investment amount is ₹${minAmount}.`);
        return;
      }

      const funds = [
        {
          pcode,
          allocation: "100",
          allocationAmount: enteredAmount,
        },
      ];

      const investmentData = {
        totalAmount: enteredAmount,
        funds,
      };

      localStorage.setItem("investmentData", JSON.stringify(investmentData));
      setShowInvestPopup(false);
      setInvestAmount("");
      router.push("/login");
    } catch (error) {
      console.error("Error fetching minimum amount:", error);
      alert("Failed to fetch minimum investment amount. Please try again.");
    }
  };
  const handlePopup = (pcode) => {
    setShowInvestPopup(true);
    setPcode(pcode?.pcode);
    setTitle(pcode?.funddes);
  }
  return (
    <div className="max-w-screen-xl mx-auto ">
      <div className="flex justify-between items-center">
        <Image unoptimized src="/logo.png" alt="logo" width={280} height={100} />
        <Link
          href={process.env.NEXT_PUBLIC_MAIN_DOMAIN}
          className="btn-third"
        >
          Back
        </Link>
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 ">
        <input
          type="text"
          placeholder="Search fund name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 bg-white"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 bg-white"
        >
          <option value="">Sort by</option>
          <option value="fundSize">Sort by Fund Size</option>
          <option value="returns">Sort by Returns</option>
          <option value="nav">Sort by NAV</option>
        </select>
      </div>
      {/* Popup */}
      <Dialog open={showInvestPopup} onOpenChange={setShowInvestPopup}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogTitle className="text-lg">Enter Lumpsum Amount</DialogTitle>
          </DialogHeader>

          <div>
            <Input
              type="number"
              min={1}
              placeholder={`Enter Investment Amount`}
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
            />
            {errorMessage && (
              <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="disclaimerCheckbox"
              type="checkbox"
              className="mt-1 w-4 h-4 text-[var(--rv-primary)] border-gray-300 rounded focus:ring-[var(--rv-primary)]"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <label
              htmlFor="disclaimerCheckbox"
              className="text-start text-sm text-gray-700 leading-snug"
            >
              I understand this is factual information only and I am investing at my own discretion.
              <br />
              This transaction is execution-only, and the distributor has not provided investment advice.
            </label>
          </div>
          <div className="flex justify-center gap-3">
            <button
              className={`${isConfirmed ? "btn-third" : "btn-disabled"}`}
              onClick={() => handleInvestSubmit(pcode)}
              disabled={!isConfirmed}
            >
              Purchase
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Fund List */}
      <div className="bg-[var(--rv-primary)] text-[var(--rv-white)] h-[calc(100vh-380px)] overflow-auto shadow rounded ">
        {filteredFunds.length > 0 ? (
          filteredFunds.map((fund, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row justify-between items-center border-b border-[var(--rv-ternary)] gap-4 p-4 hover:bg-[var(--rv-ternary)] cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full md:w-1/2" onClick={() => handleSelectFunds(fund)}>
                {/* <Image unoptimized
                  src={fund.logo || "/default-logo.png"}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="rounded"
                /> */}
                <div>
                  <p className="font-semibold">{fund.funddes}</p>
                  <p className="text-sm text-gray-200">
                    {fund.schemeCategory}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center text-center w-full md:w-1/2">
                <div className="md:text-right" onClick={() => handleSelectFunds(fund)}>
                  <p className="text-sm text-gray-200">Corpus</p>
                  <p className="font-medium text-gray-200">
                    ₹{fund?.Corpus} Cr
                  </p>
                </div>
                <div className="md:text-right" onClick={() => handleSelectFunds(fund)}>
                  {fund?.fiveyear_navEndDate &&
                    fund.fiveyear_navEndDate !== "0.00" && (
                      <div>
                        <p className="text-sm text-gray-200">NAV</p>
                        <p className="font-medium text-gray-200">
                          ₹{fund?.fiveyear_navEndDate}
                        </p>
                      </div>
                    ) || (fund?.threeyear_navEndDate &&
                      fund.threeyear_navEndDate !== "0.00" && (
                        <div>
                          <p className="text-sm text-gray-200">NAV</p>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.threeyear_navEndDate}
                          </p>
                        </div>
                      ))
                    || (fund?.oneyear_navEndDate
                      &&
                      fund.oneyear_navEndDate !== "0.00" && (
                        <div>
                          <p className="text-sm text-gray-200">NAV</p>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.oneyear_navEndDate}
                          </p>
                        </div>
                      )) || (/* Add six_month check here if available */
                      fund?.sixmonth_navEndDate &&
                      fund.sixmonth_navEndDate !== "0.00" && (
                        <div>
                          <h3 className="text-sm text-gray-200">NAV</h3>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.sixmonth_navEndDate}
                          </p>
                        </div>
                      ))
                    || (/* Add six_month check here if available */
                      fund?.three_month &&
                      fund.three_month !== "0.00" && (
                        <div>
                          <h3 className="text-sm text-gray-200">NAV: 6 Month Data</h3>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.three_month}
                          </p>
                        </div>
                      ))
                    || (/* Add six_month check here if available */
                      fund?.onemonth_navEndDate &&
                      fund.onemonth_navEndDate !== "0.00" && (
                        <div>
                          <h3 className="text-sm text-gray-200">NAV: 6 Month Data</h3>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.onemonth_navEndDate}
                          </p>
                        </div>
                      ))
                    || (/* Add six_month check here if available */
                      fund?.oneweek_navEndDate &&
                      fund.oneweek_navEndDate !== "0.00" && (
                        <div>
                          <h3 className="text-sm text-gray-200">NAV: 6 Month Data</h3>
                          <p className="text-lg font-medium text-gray-200">
                            ₹ {fund?.oneweek_navEndDate}
                          </p>
                        </div>
                      ))}

                </div>
                <div className="md:text-right" onClick={() => handleSelectFunds(fund)}>
                  {(() => {
                    const {
                      five_year,
                      three_year,
                      one_year,
                      nine_month,
                      six_month,
                      three_month,
                      one_month,
                      one_week,
                    } = fund || {};

                    let value = "0.00";
                    let label = "";

                    if (five_year !== "0.00") {
                      value = five_year;
                      label = "5Y";
                    } else if (three_year !== "0.00") {
                      value = three_year;
                      label = "3Y";
                    } else if (one_year !== "0.00") {
                      value = one_year;
                      label = "1Y";
                    } else if (nine_month !== "0.00") {
                      value = nine_month;
                      label = "9M";
                    } else if (six_month !== "0.00") {
                      value = six_month;
                      label = "6M";
                    } else if (three_month !== "0.00") {
                      value = three_month;
                      label = "3M";
                    } else if (one_month !== "0.00") {
                      value = one_month;
                      label = "1M";
                    } else if (one_week !== "0.00") {
                      value = one_week;
                      label = "1W";
                    } else {
                      value = "0";
                      label = "1D";
                    }

                    return (
                      <>
                        <p className="text-sm text-gray-200">
                          {label} CAGR returns
                        </p>
                        <p className="font-medium text-green-600">{value}%</p>
                      </>
                    );
                  })()}
                </div>
                <div className="md:text-right">
                  <button
                    onClick={() => handlePopup(fund)}
                    className={`btn btn-secondary`}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <TopFundskeleton />
        )}
      </div>
    </div>
  );
}
