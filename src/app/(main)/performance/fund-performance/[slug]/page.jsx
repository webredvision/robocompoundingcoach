import React from "react";
import FundPerformancePageComponent from "@/components/performanceComponent";

const Page = () => {
  const envs = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ARNID: process.env.ARNID,
    ARN_NUMBER: process.env.ARN_NUMBER,
    DESK_TYPE: process.env.DESK_TYPE,
    SITE_URL: process.env.SITE_URL,
    CALLBACK_URL: process.env.CALLBACK_URL,
  };
  return (
    <FundPerformancePageComponent envs={envs} />
  );
};

export default Page;
