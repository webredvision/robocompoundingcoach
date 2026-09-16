// components/FundCategoryTabs.js
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CryptoJS from "crypto-js";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FundCategorySkeleton } from "../skeletons/performanceSkeleton";

export default function FundCategoryTabs() {
  const [activeTab, setActiveTab] = useState("Equity");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);


  const tabs = ["Equity", "Debt", "Hybrid", "Sol Oriented", "Others"];
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
  const router = useRouter();

  const fetchSchemes = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/fund-performance/fpsub-category?categorySchemes=${category}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      if (response.status === 200) {
        setSchemes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchSchemes(activeTab);
    }
  }, [activeTab]);


  useEffect(() => {
    // Simulate fetch delay or trigger when actual data is ready
    const timer = setTimeout(() => {
      setLoadingMain(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);


  const handleCategorySelect = (category) => {
    setActiveTab(category); // let useEffect handle fetch
  };

  const handlecategory = (item) => {
    const dataToStore = {
      schemeName: item,
      timestamp: Date.now(),
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(dataToStore),
      SECRET_KEY
    ).toString();

    localStorage.setItem("encryptedscheme", encrypted);

    const slug = item
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    router.push(`/performance/fund-performance/${slug}`);
  };

  return (
    <div className="flex flex-col gap-5 md:gap-0 ">
      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-3 md:px-10">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`flex items-center gap-2 p-4 rounded-t  font-semibold transition-all duration-300 ${activeTab === tab
              ? " bg-[var(--rv-primary)] text-[var(--rv-white)] "
              : " bg-[#ddd]  hover:bg-[var(--rv-primary)] hover:text-[var(--rv-white)] mb-1"
              }`}
            onClick={() => handleCategorySelect(tab)}
          >
            <div>
              <div className="bg-white md:w-14 md:h-14 w-10 h-10  rounded-full p-3">
                <Image unoptimized
                  src={`/images/icons/performance/${tab
                    .toLowerCase()
                    .replace(/ /g, "-")}.svg`}
                  alt={tab}
                  width={30}
                  height={30}
                  className=""
                />
              </div>
            </div>
            <p className="md:text-xl"> {tab}</p>
          </button>
        ))}
      </div>

      <div className="bg-[var(--rv-primary)] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-6">
          {loadingMain ? (
            <FundCategorySkeleton />
          ) : (
            schemes.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center px-4 justify-between rounded-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => handlecategory(item)}
              >
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--rv-ternary)] rounded-full p-2">
                    <Image unoptimized
                      src={`/images/icons/performance/${activeTab
                        .toLowerCase()
                        .replace(/\s+/g, "")}/${idx}.svg`}
                      alt={activeTab}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="text-lg font-medium text-[var(--rv-white)]">
                    {item}
                  </div>
                </div>

                <div className="p-1 rounded-full transition-all group-hover:bg-white group-hover:p-2 group-hover:-rotate-45">
                  <FaArrowRight className="text-[var(--rv-white)] group-hover:text-[var(--rv-ternary)] transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
