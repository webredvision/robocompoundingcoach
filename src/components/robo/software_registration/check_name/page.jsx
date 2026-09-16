"use client";

import { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// ✅ PAN validation schema
const kycSchema = z.object({
  pan_number: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN number")
    .length(10, "PAN must be 10 characters"),
});

const CheckKyc = ({ roboUser, onSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      pan_number: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setError(null);

    const formData = {
      arn_id: roboUser?.arnId,
      pan_number: values.pan_number.toUpperCase(),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/robo/registration/get-client-name-by-pan`,
        formData
      );

      const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

      if (response.data.status === 1) {
        const { name, dob } = response.data.data;

        localStorage.setItem(
          "client_name",
          CryptoJS.AES.encrypt(name, secretKey).toString()
        );
        localStorage.setItem(
          "client_dob",
          CryptoJS.AES.encrypt(dob, secretKey).toString()
        );
        localStorage.setItem(
          "client_pan",
          CryptoJS.AES.encrypt(formData.pan_number, secretKey).toString()
        );

        onSuccess?.();
      } else {
        localStorage.setItem(
          "client_pan",
          CryptoJS.AES.encrypt(formData.pan_number, secretKey).toString()
        );
        onSuccess?.();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[var(--rv-primary-light)] p-10 rounded-xl shadow-xl flex flex-col">
      {/* HEADER */}
      <div className="">
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
      </div>

      {/* CENTERED CARD */}
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-xl border-none shadow-none bg-card-none p-0">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-black mb-3">
              Register Now
            </h1>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  {...register("pan_number")}
                  maxLength={10}
                  placeholder="Enter your PAN"
                  className="uppercase border"
                  onChange={(e) =>
                    (e.target.value = e.target.value.toUpperCase())
                  }
                />
                {errors.pan_number && (
                  <p className="text-sm text-red-500">
                    {errors.pan_number.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-third w-full"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <p className="text-center my-4">or</p>

            <Link href="/login">
              <button className="btn btn-third w-full">Login</button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckKyc;
