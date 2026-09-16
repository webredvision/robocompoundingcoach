import { ConnectDB } from "@/lib/db/ConnectDB";
import RiskQuestionModel from "@/lib/models/RiskQuestionModel";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await ConnectDB();
    const { question, answers } = await req.json();

    if (!question || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await RiskQuestionModel.findByIdAndUpdate(
      params.id,
      { question, answers },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}