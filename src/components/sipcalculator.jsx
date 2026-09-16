import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const SipCalculator = ({ data }) => {
    const router = useRouter();
    const [monthlyInvestment, setMonthlyInvestment] = useState(500);
    const [oneTimeInvestment, setOneTimeInvestment] = useState(5000);
    const [investmentDuration, setInvestmentDuration] = useState(1);
    const [investAmount, setInvestAmount] = useState("");
    const [showInvestPopup, setShowInvestPopup] = useState(false);
    const [expectedReturn] = useState(data);
    const [result, setResult] = useState(null);
    const [isMonthlySip, setIsMonthlySip] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [minAmount, setMinimumAmount] = useState("");

    const calculateSip = () => {
        const monthlyRate = expectedReturn?.si / 12 / 100 || 0;
        const months = investmentDuration * 12;

        let futureValue, totalInvestment;

        if (isMonthlySip) {
            futureValue =
                monthlyInvestment *
                ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
                (1 + monthlyRate);
            totalInvestment = monthlyInvestment * months;
        } else {
            futureValue = oneTimeInvestment * Math.pow(1 + monthlyRate, months);
            totalInvestment = oneTimeInvestment;
        }

        setResult({
            futureValue: Number(Math.round(futureValue)),
            totalInvestment: Number(Math.round(totalInvestment))
        });
    };

    useEffect(() => {
        calculateSip();
    }, [monthlyInvestment, oneTimeInvestment, investmentDuration, expectedReturn, isMonthlySip]);

    const setDuration = (years) => {
        const parsedYears = parseFloat(years);
        if (!isNaN(parsedYears) && parsedYears > 0) {
            setInvestmentDuration(parsedYears);
        } else {
            setInvestmentDuration(1);
        }
    };

    useEffect(() => {
        const fetchMinimumAmount = async () => {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_DATA_API}/api/get-minimum-amount`,
                {
                    schemeCode: data?.pcode,
                    arn_id: 9,
                }
            );
            const min = res.data.data || {};
            setMinimumAmount(min[data?.pcode] || 0);
        };
        fetchMinimumAmount();
    }, [minAmount]);

    const handleInvestSubmit = async (result, pcode) => {
        try {
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
                    pcode: pcode,
                    allocation: "100",
                    allocationAmount: enteredAmount,
                },
            ];
            const investmentData = {
                totalAmount: enteredAmount,
                funds,
            };
            localStorage.setItem("investmentData", JSON.stringify(investmentData));

            router.push("/login");
            setShowInvestPopup(false);
            setInvestAmount("");
        } catch (error) {
            console.error("Error fetching minimum amount:", error);
            alert("Failed to fetch minimum investment amount. Please try again.");
        }
    };


    return (
        <div className="sip-calculator container mx-auto p-3 sticky top-0 z-10 border rounded-lg min-h-[37rem] bg-white">
            <h2 className="text-2xl font-bold text-center mb-2">SIP Calculator</h2>

            {/* Toggle */}
            <div className="flex justify-center space-x-4 mb-8">
                <Button
                    onClick={() => setIsMonthlySip(true)}
                    className={`rounded-full hover:bg-[var(--rv-primary)] hover:text-[var(--rv-white)] ${isMonthlySip ? 'bg-[var(--rv-primary)] text-white' : 'bg-white text-[var(--rv-primary)] border'}`}
                >
                    Monthly SIP
                </Button>
                <Button
                    onClick={() => setIsMonthlySip(false)}
                    className={`rounded-full hover:bg-[var(--rv-primary)] hover:text-[var(--rv-white)] ${!isMonthlySip ? 'bg-[var(--rv-primary)] text-white' : 'bg-white text-[var(--rv-primary)] border'}`}
                >
                    One-Time Investment
                </Button>
            </div>
            <div className="input-fields mt-5 mb-10">
                {isMonthlySip ? (
                    <div>
                        <div className="flex justify-between items-center">
                            <h5>Monthly investment</h5>
                            <div>
                                <span className="font-semibold text-[var(--rv-primary)]">₹</span>
                                <input
                                    type="number"
                                    min={500}
                                    value={monthlyInvestment}
                                    onChange={(e) =>
                                        setMonthlyInvestment(e.target.value)
                                    }
                                    className="font-semibold text-[var(--rv-primary)] w-20 border-none"
                                />
                            </div>
                        </div>
                        <Input
                            type="range"
                            min="500"
                            max="100000"
                            step="100"
                            value={monthlyInvestment}
                            onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value))}
                            className="w-full text-gray-400"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between">
                            <h5>Total investment</h5>
                            <div>
                                <span className="font-semibold text-[var(--rv-primary)]">₹</span>
                                <input
                                    type="number"
                                    min={1000}
                                    value={oneTimeInvestment}
                                    onChange={(e) =>
                                        setOneTimeInvestment(Math.max(1000, parseFloat(e.target.value) || 1000))
                                    }
                                    className="font-semibold text-[var(--rv-primary)] w-20 border-none"
                                />
                            </div>
                        </div>
                        <Input
                            type="range"
                            min="1000"
                            max="1000000"
                            step="100"
                            value={oneTimeInvestment}
                            onChange={(e) => setOneTimeInvestment(parseFloat(e.target.value))}
                            className="w-full text-gray-400"
                        />
                    </div>
                )}

                <div className="items-center mt-5">
                    <div className="flex justify-between">
                        <h5>Years</h5>
                        <input
                            type="number"
                            min={1}
                            value={investmentDuration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="font-semibold text-[var(--rv-primary)] w-10 border-none"
                        />
                    </div>
                    <Input
                        type="range"
                        min="1"
                        max="90"
                        step="1"
                        value={investmentDuration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full text-gray-400"
                    />
                </div>
            </div>

            {result && (
                <div className="mt-5">
                    <div className="flex justify-between px-5 mb-3">
                        <p>Invested Amount </p>
                        <p className="font-bold text-lg">₹{result.totalInvestment.toLocaleString('en-IN')}</p>
                    </div>
                    <hr className="mb-3" />
                    <div className="flex justify-between px-5 mb-3">
                        <p>Estimated Growth </p>
                        <p className="font-bold text-lg">₹{(result.futureValue - result.totalInvestment).toLocaleString('en-IN')}</p>
                    </div>
                    <hr className="mb-3" />
                    <div className="flex justify-between px-5 mb-3">
                        <p>Expected Amount </p>
                        <p className="font-bold text-lg">₹{result.futureValue.toLocaleString('en-IN')}</p>
                    </div>
                    <hr />
                </div>
            )}

            {/* Popup */}
            <Dialog open={showInvestPopup} onOpenChange={setShowInvestPopup}>
                <DialogContent className="max-w-xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{data?.funddes}</DialogTitle>
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
                            className={isConfirmed ? "btn-third" : "btn-disabled"}
                            onClick={() => handleInvestSubmit(result, data?.pcode)}
                            disabled={!isConfirmed}
                        >
                            Purchase
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            {!isMonthlySip &&
                <div className="flex justify-center items-center mt-10">
                    <button
                        onClick={() => setShowInvestPopup(true)}
                        className="btn-third"
                    >
                        Purchase Now
                    </button>
                </div>
            }
        </div>
    );
};

export default SipCalculator;
