import { ConnectDB } from "@/lib/db/ConnectDB";
import LoginGroupModel from "@/lib/models/LoginModel";
import axios from "axios";

const { NextResponse } = require("next/server");


function loginItemsChanged(oldItems, newItems) {
    if (oldItems.length !== newItems.length) return true;

    const mapOld = new Map();
    for (const item of oldItems) {
        mapOld.set(item._id.toString(), {
            login_value: item.login_value,
            login_name: item.login_name,
            login_desk: item.login_desk,
            login_status: item.login_status,
        });
    }

    for (const newItem of newItems) {
        const old = mapOld.get(newItem._id.toString());
        if (!old) return true;

        if (
            old.login_value !== newItem.login_value ||
            old.login_name !== newItem.login_name ||
            old.login_desk !== newItem.login_desk ||
            old.login_status !== newItem.login_status
        ) {
            return true;
        }
    }

    return false;
}

export async function GET() {
    let syncFailed = false;
    try {
        await ConnectDB();
        let externalGroups = [];

        try {
            const response = await axios.get(`${process?.env?.NEXT_PUBLIC_DATA_API}/api/logindesk`);
            externalGroups = response.data;

            // Sync creation or update
            for (const externalGroup of externalGroups) {
                const localGroup = await LoginGroupModel.findById(externalGroup._id);

                if (!localGroup) {
                    externalGroup.loginitems = externalGroup.loginitems.map(item => ({
                        ...item,
                        isstatus: false,
                    }));

                    await LoginGroupModel.create(externalGroup);
                } else {
                    const shouldUpdate =
                        externalGroup.name !== localGroup.name ||
                        loginItemsChanged(localGroup.loginitems, externalGroup.loginitems);

                    if (shouldUpdate) {
                        const statusMap = new Map();
                        localGroup.loginitems.forEach(item => {
                            statusMap.set(item._id.toString(), item.isstatus || false);
                        });

                        const updatedItems = externalGroup.loginitems.map(item => ({
                            ...item,
                            isstatus: statusMap.get(item._id.toString()) ?? false,
                        }));

                        localGroup.name = externalGroup.name;
                        localGroup.loginitems = updatedItems;
                        localGroup.updatedAt = externalGroup.updatedAt;

                        await localGroup.save();
                    }
                }
            }

            // Deletion logic
            const externalIds = externalGroups.map(g => g._id.toString());
            const localGroups = await LoginGroupModel.find().select("_id").lean();

            for (const local of localGroups) {
                const localIdStr = local._id.toString();
                if (!externalIds.includes(localIdStr)) {
                    await LoginGroupModel.findByIdAndDelete(local._id);
                }
            }

        } catch (syncError) {
            syncFailed = true;
            console.error("❌ Sync failed:", syncError.message);
        }

        // 🟡 Load synced data
        const finalLocalGroups = await LoginGroupModel.find();

        // 🟢 Step 1: Get all login_desk where any isstatus === true
        const activeDesks = new Set();
        finalLocalGroups.forEach(group => {
            group.loginitems.forEach(item => {
                if (item.isstatus) {
                    activeDesks.add(item.login_desk);
                }
            });
        });

        // 🟢 Step 2: Update loginitems for those desks to isstatus: true
        const updatePromises = finalLocalGroups.map(async group => {
            let changed = false;

            const updatedItems = group.loginitems.map(item => {
                const shouldBeTrue = activeDesks.has(item.login_desk);
                if (item.isstatus !== shouldBeTrue) {
                    changed = true;
                    item.isstatus = shouldBeTrue;
                }
                return item;
            });

            if (changed) {
                group.loginitems = updatedItems;
                await group.save(); // save to DB
            }

            return group.toObject(); // return plain object for response
        });

        const normalizedGroups = await Promise.all(updatePromises);

        return NextResponse.json(
            {
                message: syncFailed
                    ? "Local data returned (sync failed)"
                    : "Sync complete, normalized and saved",
                data: normalizedGroups,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("🔥 Error in GET /api/login:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await ConnectDB();
        const body = await request.json();
        const { selectedDesk } = body;

        if (!selectedDesk) {
            return NextResponse.json(
                { message: "selectedDesk is required" },
                { status: 400 }
            );
        }

        const groups = await LoginGroupModel.find();

        for (const group of groups) {
            let updated = false;

            group.loginitems.forEach((item) => {
                const shouldBeTrue = item.login_desk === selectedDesk;
                if (item.isstatus !== shouldBeTrue) {
                    item.isstatus = shouldBeTrue;
                    updated = true;
                }
            });

            if (updated) {
                await group.save();
            }
        }

        return NextResponse.json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating status:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}