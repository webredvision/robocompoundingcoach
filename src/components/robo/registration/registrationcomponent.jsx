"use client";
import { useState, useEffect } from "react";
import CheckNamePan from "@/components/robo/software_registration/check_name/page.jsx";
import SoftwareRegistration from "@/components/robo/software_registration/registration/page.jsx";
import Image from "next/image";

export default function RegistrationComponent({ envs }) {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const pan = sessionStorage.getItem("client_pan");
    if (pan) {
      setIsVerified(true);
    }
  }, []);
  const roboUser = {
    roboUser: true,
    arnId: envs.ARNID,
    arnNumber: envs.ARN_NUMBER,
    deskType: envs.DESK_TYPE,
    SITE_URL: envs.SITE_URL,
    CALLBACK_URL: envs.CALLBACK_URL,
  }
  return (
    <>
      <div className="">
        <div className="max-w-screen-xl mx-auto flex items-center gap-5 ">
          <div className="flex flex-col gap-4 w-full pt-[40px]"  >
            {isVerified ? (
              <SoftwareRegistration roboUser={roboUser} />
            ) : (
              <CheckNamePan roboUser={roboUser} onSuccess={() => setIsVerified(true)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
