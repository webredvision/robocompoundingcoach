"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function TopSuggestedFund({ performanceData, schemeName, roboUser, answers, questions }) {
  const [fundList, setFundList] = useState(performanceData);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [investAmount, setInvestAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showInvestPopup, setShowInvestPopup] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null); // instead of showInvestPopup
  const router = useRouter();
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
  const openInvestPopup = (fund) => {
    setSelectedFund(fund);
    setInvestAmount("");
    setErrorMessage("");
  };
  const closeInvestPopup = () => {
    setSelectedFund(null);
  };
  useEffect(() => {
    if (performanceData && Array.isArray(performanceData)) {
      const topData = performanceData;
      setFundList(topData);
    }
  }, [performanceData]);

  useEffect(() => {
    let result = [...fundList];
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
    setFilteredFunds(result);
  }, [fundList]);

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
    router.push("/performance/fund-performance/fund-details");
  };

  const handleInvestSubmit = async (pcode) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/robo/get-minimum-amount`,
        {
          schemeCode: pcode,
          arn_id: roboUser.arnId,
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
      try {
        const payload = {
          arnId: roboUser.arnId,
          clientId: roboUser.arnNumber,
          all_questions_ans: answers.map((ans) => {
            // Find the selected answer index from the questions array
            const question = questions.find(q => q._id === ans.questionId);
            const answerIndex = question?.answers.findIndex(a => a.marks == ans.selectedAnswerMarks) ?? 0;

            return {
              question_id: ans.questionId,
              answer_id: `ans_${answerIndex}_${ans.questionId}`, // selected answer index
              answer: ans.selectedAnswerText,
              marks: ans.selectedAnswerMarks,
            };
          }),
          risk_profile: "true", // ✅ add a status flag
        };

        // Save payload to localStorage
        localStorage.setItem("riskProfilePayload", JSON.stringify(payload));
        router.push("/login");

      } catch (error) {
        console.error("Error submitting answers:", error);
        toast({
          title: "Error",
          description: "Failed to submit your answers. Please try again.",
          variant: "destructive",
        });
      }
      //  router.push("/login");
    } catch (error) {
      console.error("Error fetching minimum amount:", error);
      alert("Failed to fetch minimum investment amount. Please try again.");
    }
  };

  return (
    <div className="mx-auto">
      <Toaster />
      <div className="bg-[var(--rv-primary)] text-[var(--rv-white)] shadow rounded overflow-hidden">
        {filteredFunds.length > 0 ? (
          filteredFunds.map((fund, idx) => (
            <div
              key={idx}
              className="
                group
                flex flex-col md:flex-row justify-between items-center 
                border-b border-[var(--rv-primary)] gap-4 p-4 
                hover:bg-[var(--rv-secondary-dark)] cursor-pointer
                transition-all duration-300
              "
            >
              {/* Left Section */}
              <div
                className="flex items-center gap-3"
                onClick={() => handleSelectFunds(fund)}
              >
                <div>
                  <p className="font-semibold group-hover:text-[var(--rv-white)] transition-all">
                    {fund.funddes}
                  </p>
                  <p className="text-sm text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                    {fund.schemeCategory}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center text-center">

                {/* Corpus */}
                <div className="md:text-right" onClick={() => handleSelectFunds(fund)}>
                  <p className="text-sm text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                    Corpus
                  </p>
                  <p className="font-medium text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                    ₹{fund?.Corpus} Cr
                  </p>
                </div>

                {/* NAV Section */}
                <div className="md:text-right" onClick={() => handleSelectFunds(fund)}>
                  {(() => {
                    const navValue =
                      fund?.fiveyear_navEndDate !== "0.00"
                        ? fund.fiveyear_navEndDate
                        : fund?.threeyear_navEndDate !== "0.00"
                          ? fund.threeyear_navEndDate
                          : fund?.oneyear_navEndDate !== "0.00"
                            ? fund.oneyear_navEndDate
                            : fund?.sixmonth_navEndDate !== "0.00"
                              ? fund.sixmonth_navEndDate
                              : fund?.three_month !== "0.00"
                                ? fund.three_month
                                : fund?.onemonth_navEndDate !== "0.00"
                                  ? fund.onemonth_navEndDate
                                  : fund?.oneweek_navEndDate !== "0.00"
                                    ? fund.oneweek_navEndDate
                                    : null;

                    return navValue ? (
                      <>
                        <p className="text-sm text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                          NAV
                        </p>
                        <p className="font-medium text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                          ₹{navValue}
                        </p>
                      </>
                    ) : null;
                  })()}
                </div>

                {/* Returns */}
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
                    }

                    return (
                      <>
                        <p className="text-sm text-gray-200 group-hover:text-[var(--rv-white)] transition-all">
                          {label} CAGR returns
                        </p>
                        <p className="font-semibold text-green-500 group-hover:text-[var(--rv-white)] transition-all">
                          {value}%
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Invest Button */}
                <div className="md:text-right">
                  <button
                    onClick={() => openInvestPopup(fund)}
                    className="btn-secondary"
                  // className="px-2 py-2 bg-[var(--rv-black)] rounded-full text-[var(--rv-primary)]"
                  >
                    Purchase Now
                  </button>

                </div>

                {selectedFund && (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
                    <div className="bg-white text-black rounded-lg shadow-xl max-w-lg w-full px-7 py-6 relative">
                      {/* Close button */}
                      <button
                        onClick={closeInvestPopup}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-200 text-2xl"
                      >
                        &times;
                      </button>

                      {/* Fund name */}
                      <h2 className="text-start text-xl font-bold mb-3">{selectedFund?.funddes}</h2>
                      <p className="text-start mb-2 font-medium">Enter Lumpsum Amount</p>

                      {/* Input Field */}
                      <input
                        type="number"
                        min={1}
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="Enter Investment Amount"
                        className="border rounded-lg w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--rv-primary)]"
                      />

                      {/* Error message */}
                      {errorMessage && (
                        <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
                      )}

                      {/* ✅ Disclaimer Checkbox */}

                      <div className="flex items-start gap-2 mb-4">
                        <input
                          id="disclaimerCheckbox"
                          type="checkbox"
                          className="mt-1 w-4 h-4 text-[var(--rv-primary)] border-gray-300 rounded focus:ring-[var(--rv-primary)]"
                          checked={!!selectedFund.confirmed}
                          onChange={(e) =>
                            setSelectedFund({ ...selectedFund, confirmed: e.target.checked })
                          }
                        />
                        <label htmlFor="disclaimerCheckbox" className="text-start text-sm text-gray-700 leading-snug">
                          I understand this is factual information only and I am investing at my own discretion.
                          <br />
                          This transaction is execution-only, and the distributor has not provided investment advice.
                        </label>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleInvestSubmit(selectedFund?.pcode)}
                          disabled={!selectedFund?.confirmed}
                          className={`${!selectedFund?.confirmed ? 'btn-disabled' : 'btn btn-third'}`}
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No funds match your search.
          </div>
        )}
      </div>
    </div>
  );
}
