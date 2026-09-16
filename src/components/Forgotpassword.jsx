"use client";
import React, { useState } from "react";
import axios from "axios";

export default function ForgotPasswordModal({ isOpen, onClose, logintype }) {
  const [error, setError] = useState("");
  const [mobileno, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [otpField, setOtpField] = useState(false);
  const [provider, setProvider] = useState({
    userName: "",
    type: logintype,
    source: "link",
  });

  const otpData = {
    OtpMobileNo: mobileno,
    mobileOtp: otp,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (otpField) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_DATA_API}/api/login/submit-forget-password`,
          otpData
        );
        if (response.data.msgType === "success") {
          setError(response.data.msg);
        } else {
          setError(response.data.msg);
        }
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_DATA_API}/api/login/forget-password`,
          provider
        );
        if (response.data.msgType === "success") {
          setOtpField(true);
          setError(
            `OTP sent to ******${response.data.mobileLastFourDigit} and ${response.data.email}`
          );
          setMobileNo(response.data.encryptedMobileNo);
        } else {
          setError(response.data.msg);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-xl">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={provider.userName}
            onChange={(e) =>
              setProvider({ ...provider, userName: e.target.value })
            }
            className="w-full px-4 py-2 rounded bg-[#E8EFFE] border border-gray-300 text-sm"
          />
          {otpField && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#E8EFFE] border border-gray-300 text-sm my-5"
            />
          )}
          <button
            type="submit"
            className="btn btn-third w-full mt-5"
          >
            Submit
          </button>
          {error && (
            <div className={`mt-3 text-sm ${otpField ? "text-green-600" : "text-red-600"}`}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
