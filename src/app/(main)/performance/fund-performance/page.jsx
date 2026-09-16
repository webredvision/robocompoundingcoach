import FundCategoryTabs from "@/components/FundCategoryTabs/page";
import Image from "next/image";
import Link from "next/link";

export default function MarketUpdate() {
  return (
    <>
      <div className="pt-20">
        {/* <div className="  "> */}
        <div className="max-w-screen-xl mx-auto p-10 bg-[var(--rv-primary-light)] rounded-xl shadow-xl h-[calc(100vh-100px)] flex flex-col">
          <div className="flex justify-between items-center">
            <Image unoptimized src="/logo.png" alt="logo" width={280} height={100} />
            <Link
              href={process.env.NEXT_PUBLIC_MAIN_DOMAIN}
              className="btn-third"
            >
              Back
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <FundCategoryTabs />
          </div>
        </div>
      </div></>
  );
}