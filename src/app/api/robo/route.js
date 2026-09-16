import { ConnectDB } from "@/lib/db/ConnectDB";
import RoboModel from "@/lib/models/RoboModel";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await ConnectDB();

    const roboUser = await RoboModel.findOne({
      roboUser: true,
      softwareUser: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: roboUser,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching Robo User:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to fetch Robo User",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
