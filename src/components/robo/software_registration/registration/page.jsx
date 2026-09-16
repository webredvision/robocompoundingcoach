"use client";
import { useState, useEffect, forwardRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CryptoJS from "crypto-js";
import { ChevronDownIcon } from "lucide-react";
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema } from "@/lib/fullSchema"; // path as per your project
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoaderCircle from "@/components/Loader/LoaderCircle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import Image from "next/image";

const Registration = ({ roboUser }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [otpSend, setOtpSend] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showBSEPopup, setShowBSEPopup] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [provider, setProvider] = useState({ username: "", password: "" });
  const [timer, setTimer] = useState(120) // 2 minutes in seconds
  const [resendEnabled, setResendEnabled] = useState(false);
  const [desk, setDesk] = useState(roboUser.deskType); // IFA ya ARN

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email_id: "",
      mobile_number: "",
      pan_number: "",
      dob: undefined,
      otp: "",
      arn_no: roboUser.arnNumber,
      pcode: [],
      amount: [],
    },
  });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("investmentData");
      if (storedData) {
        const parsed = JSON.parse(storedData);

        // make sure funds exist before mapping
        if (Array.isArray(parsed.funds)) {
          const pcodeArray = parsed.funds.map((f) => f.pcode);
          const amountArray = parsed.funds.map((f) => f.allocationAmount);

          setProvider((prev) => ({
            ...prev,
            pcode: pcodeArray,
            amount: amountArray,
          }));
        }
      }
    } catch (error) {
      console.error("Error parsing investmentData from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    try {
      const encryptedName = localStorage.getItem("client_name");
      const encryptedPan = localStorage.getItem("client_pan");
      const encryptedDob = localStorage.getItem("client_dob");
      if (encryptedName && encryptedPan && encryptedDob) {
        const name = CryptoJS.AES.decrypt(encryptedName, secretKey).toString(CryptoJS.enc.Utf8);
        const pan = CryptoJS.AES.decrypt(encryptedPan, secretKey).toString(CryptoJS.enc.Utf8);
        const dobStr = CryptoJS.AES.decrypt(encryptedDob, secretKey).toString(CryptoJS.enc.Utf8);

        // ✅ Parse DOB string to Date object
        const parsedDob = new Date(dobStr);
        const isValidDate = !isNaN(parsedDob);
        setValue("name", name);
        setValue("pan_number", pan);
        if (isValidDate) {
          setValue("dob", parsedDob);
        }
      }
      else if (encryptedPan) {
        const panNew = CryptoJS.AES.decrypt(encryptedPan, secretKey).toString(CryptoJS.enc.Utf8);
        setValue("pan_number", panNew)
      }
    } catch (error) {
      console.error("Decryption error:", error);
    }
  }, [setValue]);

  useEffect(() => {
    if (timer <= 0) {
      setResendEnabled(true)
      return
    }

    setResendEnabled(false)
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setResendEnabled(true) // enable button when timer ends
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("client_name") // remove when page closes or reloads
      localStorage.removeItem("client_dob") // remove when page closes or reloads
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
      localStorage.removeItem("client_name") // remove when component unmounts (navigation)
      localStorage.removeItem("client_dob") // remove when component unmounts (navigation)
    }
  }, [])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const onGenerateOtp = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/robo/registration/check-account`, {
        ...data, arn_id: roboUser.arnId, arn_no: roboUser.arnNumber,
      });
      const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
      const encryptedUser = CryptoJS.AES.encrypt(res.data.userName, secretKey).toString();
      const encryptedPass = CryptoJS.AES.encrypt(res.data.Password, secretKey).toString();

      localStorage.setItem("client_user", encryptedUser);
      localStorage.setItem("client_pass", encryptedPass);

      const msg = res.data?.msg || "";
      const apiResponse = res.data || "";
      if (apiResponse.status === false && msg.includes("This is Wrong OTP or OTP not Verified")) {
        setErrorMessage(msg);
        setShowOtpModal(true);
        setLoading(false);
        return;
      }
      if (msg.includes("account is already created")) {
        setShowBSEPopup(true);
        setSuccessText("It seems that your account is already created. Credential shared on your registered email and mobile number.");
        setLoading(false);
      } else if (msg.includes("OTP sent") && res.data.status) {
        setShowOtpModal(true); // open OTP modal
        setOtpSend(true);
        toast.success(msg);
        setLoading(false);
      } else if (msg.includes("This Email ID is already registered")) {
        setSuccessText("It seems that your account is already created. Credential shared on your registered email and mobile number.");
        toast.warn(msg);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data) => {
    setLoading(true);
    setErrorMessage(""); // Clear any previous error
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_DATA_API}/api/registration/verify-o-t-p`, {
        arnId: roboUser.arnId,
        arn_no: roboUser.arnNumber,
        // arnId: data.arn_id,
        name: data.name,
        emailId: data.email_id,
        mobileNumber: data.mobile_number,
        panNumber: data.pan_number,
        dob: data.dob?.toISOString().split("T")[0],
        otpNumber: data.otp,
        source: 'WebRobo',
      });
      const msg = res.data?.msg || "";
      const apiResponse = res.data;
      const softwareData = {
        username: apiResponse.username,
        password: apiResponse.password,
        loginFor: 'CLIENT',
        callbackUrl: roboUser.CALLBACK_URL,
        siteUrl: roboUser.SITE_URL,
        pcode: provider.pcode || [],
        amount: provider.amount || [],
        arn_no: roboUser.arnNumber,
      };
      if (apiResponse.status === false && msg.includes("This is Wrong OTP or OTP not Verified")) {
        setErrorMessage(msg);
        setShowOtpModal(true);
        setLoading(false);
        return;
      }
      if (msg.includes("Login Credentials sent")) {
        const endpoint =
          desk === "arn"
            ? "/api/login/arn-login"
            : "/api/login/ifa-login";
        const res = await axios.post(`${process.env.NEXT_PUBLIC_DATA_API}${endpoint}`, softwareData);
        if (res.data.status === true) {
          setProvider((prev) => ({ ...prev, username: "", password: "" }));
          router.push(`${res.data.url}`);
        } else {
          alert(res.data.msg);
          setLoading(false);
          setShowOtpModal(true);
        }
      } else {
        setErrorMessage(msg);
        setLoading(false);
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setErrorMessage("Something went wrong. Please try again later.");
      setLoading(false);
      setShowOtpModal(true);
    }
  };

  // Resend OTP button click
  const handleResendOtp = () => {
    const formData = getValues() // get existing form values
    onGenerateOtp(formData) // call the same function
    setTimer(120)             // reset timer to 2 minutes
    setResendEnabled(false)   // disable resend button
  }

  const CustomDateInput = forwardRef(({ value, onClick }, ref) => {
    return (
      <div
        onClick={onClick} // must call this to open calendar
        ref={ref}
        className="flex items-center rounded px-2 py-1 w-[576px] h-12 cursor-pointer border-[1px] border-[var(--rv-primary)] bg-transparent"
      >
        <input
          value={value}
          onChange={() => { }}
          className="flex-1 outline-none bg-transparent"
          placeholder="Select DOB"
          readOnly
        />
        <CalendarIcon className="ml-2 h-5 w-5" />
      </div>
    );
  });

  CustomDateInput.displayName = "CustomDateInput";
  return (
    <>
      {loading && <LoaderCircle loadingText={showOtpModal ? "Verifying OTP..." : "Processing..."} />}
      <div className="min-h-[calc(100vh-200px)] bg-[var(--rv-primary-light)] p-10 rounded-xl shadow-xl flex flex-col">
        <ToastContainer />
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image unoptimized src="/logo.png" alt="logo" width={280} height={100} />
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_MAIN_DOMAIN}
            className="btn-third"
          >
            Back
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center h-[calc(100%-52px)]">
          <Card className="w-full max-w-xl border-none shadow-none bg-card-none">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center mb-3">Register Now</h1>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onGenerateOtp)} className="space-y-4">
                <Input {...register("name")} placeholder="Name" className="border" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}

                <Input {...register("pan_number")} placeholder="PAN" className="border" />
                {errors.pan_number && <p className="text-sm text-red-500">{errors.pan_number.message}</p>}

                {/* DOB with calendar */}
                <Popover open={open} onOpenChange={setOpen}>
                  <DatePicker
                    selected={getValues("dob")}
                    onChange={(date) => setValue("dob", date)}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select DOB"
                    customInput={<CustomDateInput />}
                  />
                </Popover>

                {errors.dob && <p className="text-sm text-red-500">{errors.dob.message}</p>}

                <Input {...register("email_id")} placeholder="Email" className="border" />
                {errors.email_id && <p className="text-sm text-red-500">{errors.email_id.message}</p>}

                <Input {...register("mobile_number")} placeholder="Mobile" maxLength={10} className="border" />
                {errors.mobile_number && <p className="text-sm text-red-500">{errors.mobile_number.message}</p>}

                <button type="submit" className="btn btn-third w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Generate OTP"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="bg-white">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
            <Input {...register("otp")} placeholder="Enter OTP" />
            {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

            <p className="text-sm text-gray-500">
              {resendEnabled ? "You can resend OTP now." : `Resend OTP in ${formatTime(timer)}`}
            </p>

            <Button
              type="button"
              onClick={handleResendOtp}
              className="w-full hover:bg-[var(--rv-secondary)]"
              disabled={!resendEnabled || loading}
            >
              {loading ? "Resending..." : "Resend OTP"}
            </Button>

            <DialogFooter>
              <Button type="submit" className="w-full hover:bg-[var(--rv-secondary)]" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal for BSE Redirect */}
      <Dialog open={showBSEPopup} onOpenChange={setShowBSEPopup} >
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="bg-white">
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          Dear user, {successText} Please proceed to Login to your account.
          <DialogFooter>
            <button className="btn-third" onClick={() => router.push("/login")}>Proceed</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Registration;
