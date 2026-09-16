import { ConnectDB } from "@/lib/db/ConnectDB";
import LoginGroupModel from "@/lib/models/LoginModel";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
    let externalData;  // store data from axios call
    try {
        await ConnectDB();
        // Try calling your external/internal API
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/login`);
        externalData = response.data;
    } catch (error) {
        console.error("Axios call to /api/login failed, continuing with DB data:", error.message);
        // Don't throw here, continue with DB data regardless
    }

    try {
        // Fetch data from your DB
        const groups = await LoginGroupModel.find({
            "loginitems.isstatus": true,
        });

        // Filter loginitems with isstatus true
        const filteredGroups = groups
            .map((group) => ({
                _id: group._id,
                name: group.name,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
                loginitems: group.loginitems.filter((item) => item.isstatus === true),
            }))
            .filter((group) => group.loginitems.length > 0);

        // Return the DB data, optionally you could merge with externalData if you want
        return NextResponse.json({
            message: "Active desk items fetched successfully",
            data: filteredGroups,
            // Send external data if available
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching active desk items:", error);
        return NextResponse.json({
            message: "Server error",
            error: error.message,
        }, { status: 500 });
    }
}