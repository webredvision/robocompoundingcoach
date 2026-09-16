"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import RoundedButton from "../ui/rounded-button";
import TopSuggestedFund from "../topSuggestedFuns";
import { FundPerformanceSkeleton } from "../skeletons/fundPerformanceSkeleton";

const portfolios = [
  {
    id: 11377,
    type: "Low",
    val_1: "Conservative Portfolio (Low)",
    start_range: 0,
    end_range: 20,
  },
  {
    id: 11378,
    type: "Moderate",
    val_1: "Balanced Portfolio (Moderate)",
    start_range: 21,
    end_range: 40,
  },
  {
    id: 11379,
    type: "High",
    val_1: "Aggressive Portfolio (High)",
    start_range: 41,
    end_range: 60,
  },
  {
    id: 11380,
    type: "Moderate High",
    val_1: "Moderate Aggressive (Moderate High)",
    start_range: 61,
    end_range: 80,
  },
  {
    id: 11381,
    type: "Very High",
    val_1: "Very Aggressive Portfolio (Very High)",
    start_range: 81,
    end_range: 100,
  },
];

const RiskProfiledata = ({ roboUser }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [result, setResult] = useState({ message: "", color: "" });
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [schemeName, setSchemeName] = useState(null);

  // ---- Captcha Setup ----
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const generateCaptchaText = () =>
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  const createCaptchaSVG = (text) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" height="40" width="120">
      <rect width="100%" height="100%" fill="#f8d7c3"/>
      <text x="10" y="28" font-size="24" fill="#a30a00" font-family="monospace">${text}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptcha(newCaptcha);
    setCaptchaImage(createCaptchaSVG(newCaptcha));
  };

  // ---- Fetch Questions ----
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/risk-questions`
      );
      if (response.status === 200) setQuestions(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getResult = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/open-apis/risk-questions/get-result?arnId=${roboUser.arnId}&deskType=${roboUser.deskType}`
      );
      if (response.status === 200 && response.data.status) {
        setRiskProfiles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching risk questions", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (roboUser) getResult();
  }, [roboUser]);

  const handlePreviousClick = () => {
    if (currentQuestionIndex === 0) return;
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    const prevAnswer = answers[prevIndex];
    setSelectedAnswer(prevAnswer?.selectedAnswerMarks || null);
  };

  // ---- Handle Select ----
  const handleAnswerSelect = (item) => {
    // show the selected state immediately
    setSelectedAnswer(item.marks);

    // save the answer for current question
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      questionId: questions[currentQuestionIndex]?._id,
      question: questions[currentQuestionIndex]?.question,
      selectedAnswerText: item.text,
      selectedAnswerMarks: item.marks,
    };

    setAnswers(updatedAnswers);

    // update aggregated score
    const newScore = updatedAnswers.reduce(
      (acc, a) => acc + Number(a.selectedAnswerMarks || 0),
      0
    );
    setScore(newScore);

    // auto-advance after a short delay so the user can see their selection
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setTimeout(() => {
        setCurrentQuestionIndex(nextIndex);
        const nextAnswer = updatedAnswers[nextIndex];
        setSelectedAnswer(nextAnswer?.selectedAnswerMarks || null);
      }, 150);
    } else {
      // last question: finalize
      // Do not call the API when this is a roboUser; only finalize locally
      if (!roboUser) {
        sendAllAnswersToAPI(updatedAnswers);
      }
      setIsQuizCompleted(true);
      setShowResultPopup(true);
    }
  };

  // ---- Result Message ----
  const getResultMessage = (score) => {
    const result = portfolios.find(
      (p) => score >= p.start_range && score <= p.end_range
    );

    if (result) {
      return {
        message: result.val_1,
        type: result.type,
        color: getColorByType(result.type),
      };
    }

    // fallback if score is outside defined range
    return {
      message: "Invalid Score",
      type: "Unknown",
      color: "text-gray-500",
    };
  };

  const getModelPortfolioMap = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/open-apis/risk-questions/get-model-id?arnId=${roboUser.arnId}&deskType=${roboUser.arnId}`
      );
      if (response.status === 200 && response.data.status) {
        return response.data.data; // array of {riskProfileId, modelPortfolioId, ...}
      }
    } catch (error) {
      console.error("Error fetching model portfolio map", error);
    }
    return [];
  };

  const getModelPortfolio = async (modelPortfolioId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/open-apis/risk-questions/get-model-portfolio?arnId=${roboUser.arnId}&modelPortfolioId=${modelPortfolioId}`
      );
    } catch (error) {
      console.error("Error fetching model portfolio", error);
    }
  };

  // If this is a roboUser, derive result from riskProfiles and fetch model portfolio
  useEffect(() => {
    if (riskProfiles.length > 0) {
      const matched = riskProfiles.find((profile) => {
        const start = profile.start_range ?? 0;
        const end = profile.end_range ?? 999;
        return score >= start && score <= end;
      });

      if (matched) {
        setResult({
          message: matched.val_1 || matched.type,
          color: getColorByType(matched.type),
          id: matched.id,
          type: matched.type,
        });
        // fetch modelPortfolioId for this riskProfileId
        getModelPortfolioMap().then((mapData) => {
          const map = mapData.find((item) => item.riskProfileId == matched.id);
          if (map) {
            getModelPortfolio(map.modelPortfolioId);
          }
        });
      }
    }
  }, [riskProfiles, score, roboUser]);

  // If not a roboUser, derive result from the local portfolios mapping
  useEffect(() => {
    if (roboUser) return;

    const res = getResultMessage(score);
    setResult({
      message: res.message,
      color: res.color,
      type: res.type,
      id: null,
    });
  }, [score, roboUser]);

  const getColorByType = (type) => {
    switch (type.toLowerCase()) {
      case "low":
        return "text-red-700";
      case "moderate":
        return "text-red-500";
      case "moderate high":
        return "text-yellow-600";
      case "high":
        return "text-green-500";
      case "very high":
        return "text-green-700";
      default:
        return "text-gray-600";
    }
  };

  const getSuggestedFunds = () => {
    switch (getResultMessage(score).message) {
      case "Conservative Portfolio (Low)":
        return [
          "Liquid Fund",
          "Ultra Short Duration Fund",
          "Balanced Hybrid Fund",
        ];
      case "Balanced Portfolio (Moderate)":
        return [
          "Conservative Hybrid Fund",
          "Equity Savings Fund",
          "Multi Asset Allocation Fund",
        ];
      case "Aggressive Portfolio (High)":
        return [
          "Aggressive Hybrid Fund",
          "Large & Mid Cap Fund",
          "Index Funds/ETFs",
        ];
      case "Moderate Aggressive (Moderate High)":
        return ["Flexi Cap Fund", "Mid Cap Fund", "Focused Fund"];
      case "Very Aggressive Portfolio (Very High)":
        return ["ELSS Fund", "International Fund", "Thematic Fund"];
      default:
        return [];
    }
  };

  const fetchPerformanceData = async (categories) => {
    setLoading(true);
    try {
      // Join all categories into one string with commas
      const queryString = categories
        .map((cat) => encodeURIComponent(cat))
        .join(",");
      setSchemeName(queryString);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/open-apis/fund-performance/fp-data?categorySchemes=${queryString}`
      );


      if (response.status === 200) {
        const { data } = response.data;
        setPerformanceData(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch performance data for non-robo users after quiz completes
    if (isQuizCompleted) {
      const suggestedFunds = getSuggestedFunds();
      if (suggestedFunds.length > 0) {
        fetchPerformanceData(suggestedFunds);
      }
    }
  }, [isQuizCompleted]);

  return (
    <div>
      <Dialog open={showResultPopup} onOpenChange={setShowResultPopup}>
        <DialogContent className="max-w-2xl py-16 px-12 bg-[#eff6ff]" hideClose>
          <DialogTitle className="sr-only">Risk Profile Result</DialogTitle>
          <DialogHeader>
            <DialogDescription className="text-center">
              <p className="mt-1 font-bold text-3xl text-black">
                Your Score is{" "}
                <span
                  className={`text-3xl font-extrabold ${result?.color || ""}`}
                >
                  {score}
                </span>{" "}
                out of 100
              </p>
              <p className="mt-4 font-medium">
                <span
                  className={`font-bold text-black text-3xl ${result?.color ||
                    ""}`}
                >
                  {result?.message}
                </span>
              </p>
              <p className="mt-4 text-lg text-gray-800">
                Based on your risk profile, you can now explore mutual fund categories that generally align with this risk level.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 mt-4">
            <button
              className={`btn-third`}
              onClick={() => setShowResultPopup(false)}
            >
              Next
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* <div className=" bg-  "> */}
      <div className="max-w-screen-xl p-10 mx-auto bg-[var(--rv-primary-light)] rounded-xl shadow-xl h-[calc(100vh-52px)]">
        <div className="flex justify-between items-center">
          <Image unoptimized src="/logo.png" alt="logo" width={280} height={100} />
          <Link
            href={process.env.NEXT_PUBLIC_MAIN_DOMAIN}
            className="btn-third"
          >
            Back
          </Link>
        </div>
        <div className=" px-4">
          <Toaster />
          {loadingQuestions ? (
            <QuestionSkeleton />
          ) : isQuizCompleted ? (
            <>
              {roboUser ? (
                <div id="showfunds" className="rounded-2xl">
                  <div className="text-left">
                    <div className="text-center mb-5">
                      <h3 className="text-lg md:text-2xl font-bold mb-4">
                        Popular Mutual Funds
                      </h3>
                      <p className="text-gray-700 max-w-2xl mb-2 mx-auto">
                        Here are some of the mutual funds that investors frequently invest in.
                        Data shown is factual and based on general investor activity.
                        Please note this is not investment advice or recommendation.
                      </p>
                    </div>

                    {loading ? (
                      <FundPerformanceSkeleton />
                    ) : performanceData.length > 0 ? (
                      <TopSuggestedFund
                        performanceData={performanceData}
                        schemeName={schemeName}
                        answers={answers}
                        questions={questions}
                        roboUser={roboUser}
                      />
                    ) : (
                      <p className="text-center text-gray-600">No data available</p>
                    )}
                    <p className="text-center italic text-gray-700 max-w-2xl mx-auto mt-3">
                      <span className="font-semibold">Disclaimer: </span>The above information is provided only for investor awareness.
                      It does not constitute investment advice, research, or a recommendation to invest.
                      The distributor does not rank, rate, or endorse any scheme.
                      Investors should evaluate suitability before investing.
                    </p>
                    <div className=" flex justify-center items-center mt-4">
                      <Link
                        href="/performance/fund-performance"
                        className="btn btn-third"
                      >
                        Explore more
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {isQuizCompleted && (
                    <div id="showfunds" className=" px-10 py-7 rounded-2xl  ">
                      <div className="text-left mt-6">
                        <div className="text-center mb-5">
                          <h3 className="text-lg md:text-2xl font-bold  mb-4">
                            Suggested Funds for You
                          </h3>
                          <p className="text-gray-700 max-w-2xl mx-auto text-sm">
                            The suggested funds are provided based on general
                            categories and historical performance data. These
                            are not investment recommendations or personalized
                            financial advice. Please consult your financial
                            advisor and read all scheme-related documents
                            carefully before investing. Mutual Fund
                            investments are subject to market risks. Read all
                            scheme related documents carefully.
                          </p>
                        </div>

                        {loading && (
                          <p className="text-white">
                            <SkeletonCard />
                          </p>
                        )}

                        {!loading && performanceData.length > 0 && (
                          <TopSuggestedFund
                            performanceData={performanceData}
                            schemeName={schemeName}
                            roboUser={roboUser}
                          />
                        )}
                        <div className=" flex justify-center items-center mt-4">
                          <RoundedButton
                            label="Explore more"
                            href="/performance/fund-performance"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col">
              <div className=" text-right text-lg font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <h4 className="font-semibold mb-4">
                {questions[currentQuestionIndex]?.question}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {questions[currentQuestionIndex]?.answers?.map(
                  (answer, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerSelect(answer)}
                      className={`flex items-center gap-3 mb-3 cursor-pointer ${selectedAnswer === answer.marks
                        ? "text-[var(--rv-primary)] font-semibold"
                        : "text-gray-700"
                        }`}
                    >
                      <div
                        className={`w-3 h-3 rotate-45 border-2 border-[var(--rv-primary)] ${selectedAnswer === answer.marks
                          ? "bg-[var(--rv-primary)]"
                          : ""
                          }`}
                      ></div>
                      <span className="text-lg">{answer.text}</span>
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-4">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePreviousClick}
                    className="btn-third"
                  >
                    Previous
                  </button>
                )}
                {/* Next button removed: selection now auto-advances */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskProfiledata;

const QuestionSkeleton = () => (
  <div className="animate-pulse space-y-4 py-5">
    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    <div className="h-5 bg-gray-700 rounded w-2/3"></div>
    <div className="h-5 bg-gray-700 rounded w-1/2"></div>
    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
    <div className="h-10 bg-[var(--rv-primary)] opacity-50 rounded-full w-24"></div>
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col md:flex-row justify-between items-center border-b border-[var(--rv-primary)] gap-4 p-4">
    <div className="flex items-center gap-3 w-full md:w-1/2">
      <div className="w-16 h-16 bg-gray-300/40 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300/40 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300/40 rounded w-1/2"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center text-center w-full md:w-1/2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-gray-300/40 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300/40 rounded w-1/2 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);
