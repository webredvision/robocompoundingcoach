// app/api/risk-questions/status/route.ts
import RiskQuestionModel from "@/lib/models/RiskQuestionModel";
import { NextResponse } from "next/server";


export async function PUT(req) {
  const { status } = await req.json();
  await RiskQuestionModel.updateMany({}, { status });
  return NextResponse.json({ success: true });
}
