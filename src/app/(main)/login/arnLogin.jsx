"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ForgotPasswordModal from "@/components/Forgotpassword";
import styles from "./LoginPage.module.css";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ArnPage = ({ envs }) => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // 🔹 for page loading
    const [selectedRole, setSelectedRole] = useState("CLIENT");

    const [provider, setProvider] = useState({
        username: "",
        password: "",
        loginFor: "CLIENT",
        siteUrl: envs.SITE_URL,
        callbackUrl: envs.CALLBACK_URL,
        pcode: [],
        amount: [],
        arn_no: envs.ARN_NUMBER,
    });

    useEffect(() => {
        const storedData = localStorage.getItem("investmentData");
        if (storedData) {
            const parsed = JSON.parse(storedData);
            const pcodeArray = parsed.funds.map((f) => f?.pcode);
            const amountArray = parsed.funds.map((f) => f?.allocationAmount);

            setProvider((prev) => ({
                ...prev,
                pcode: pcodeArray,
                amount: amountArray,
            }));
        }
    }, []);

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const res = await axios.get("/api/admin/site-settings");
                if (res.status === 200 && res.data[0]) {
                    setProvider((prev) => ({
                        ...prev,
                        siteUrl: envs.SITE_URL,
                        callbackUrl: envs.CALLBACK_URL,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch site settings", error);
            }
        };

        fetchSiteData();
    }, []);

    useEffect(() => {
        setProvider((prev) => ({
            ...prev,
            username: "",
            password: "",
            loginFor: selectedRole === "ADMIN" ? "ADVISOR" : selectedRole,
        }));
    }, [selectedRole]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_DATA_API}/api/login/arn-login`,
                provider
            );
            if (res.data.status === true) {
                const payloadStr = localStorage.getItem("riskProfilePayload");
                if (payloadStr) {
                    try {
                        const payload = JSON.parse(payloadStr);
                        const apiResponse = await axios.post(
                            `${process.env.NEXT_PUBLIC_DATA_API}/api/set-client-answer`,
                            payload
                        );
                        // Mark payload as completed
                        payload.apiCallStatus = "completed";
                        localStorage.setItem("riskProfilePayload", JSON.stringify(payload));
                    } catch (err) {
                        console.error("Error sending risk profile payload:", err);
                    }
                }
                router.push(res.data.url); // redirect after API call
            } else {
                setError(res.data.msg);
                setLoading(false);
            }
        } catch (error) {
            setError(error.message || "An error occurred");
            setLoading(false);
        }
    };
    return (
        <div className={styles.loginPage}>
            <div className="max-w-screen-xl mx-auto p-10 bg-[var(--rv-primary-light)] rounded-xl shadow-xl min-h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center">
                    <Image unoptimized src="/logo.png" alt="logo" width={280} height={100} />
                    <Link
                        href={process.env.NEXT_PUBLIC_MAIN_DOMAIN}
                        className="btn-third"
                    >
                        Back
                    </Link>
                </div>
                <div className="max-w-xl mx-auto">
                    <h1 className="font-bold text-center mb-3">Login</h1>
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-lg font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={provider.username}
                                    onChange={(e) =>
                                        setProvider({ ...provider, username: e.target.value })
                                    }
                                    className="w-full outline-none rounded px-3 py-3 text-lg border border-[var(--rv-primary)]"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-lg font-medium mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={provider.password}
                                        onChange={(e) =>
                                            setProvider({ ...provider, password: e.target.value })
                                        }
                                        className="w-full outline-none rounded px-3 py-3 text-lg border border-[var(--rv-primary)] pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                                    >
                                        {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end items-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="underline"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            {/* Error */}
                            {error && <div className="text-red-600 text-xs">{error}</div>}

                            <div className="text-center space-y-4">
                                <button
                                    type="submit"
                                    className="btn btn-third w-full"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                                <p>or</p>
                            </div>
                        </form>
                    </div>
                    <Link
                        href="/"
                        disabled={loading}
                    >
                        <button className="btn btn-third w-full mt-4">
                            Sign Up
                        </button>
                    </Link>
                    <ForgotPasswordModal
                        isOpen={showForgotModal}
                        onClose={() => setShowForgotModal(false)}
                        logintype={selectedRole === "ADMIN" ? "ADVISOR" : selectedRole}
                    />
                </div>
            </div>
        </div>
    );
};

export default ArnPage;
