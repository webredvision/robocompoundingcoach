"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

// Function to filter data based on the given range
const filterDataByRange = (data, range) => {
    const now = new Date();
    const filterDate = (dateStr) => new Date(dateStr) >= range;

    // Check if range is null, which indicates that we want all data
    if (!range) {
        return data.labels
            .map((label, index) => ({
                date: label,
                value: data?.datasets[0]?.data[index],
            }))
            .filter((item) => item?.value && !isNaN(item?.value));
    }

    return data.labels
        ?.map((label, index) => ({
            date: label,
            value: data?.datasets[0]?.data[index],
        }))
        ?.filter((item) => item?.value && !isNaN(item?.value) && filterDate(item?.date));
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1F2937] text-white p-2 rounded shadow-lg border border-gray-700">
                <p className="text-sm font-medium">{`Date: ${label.slice(0, 10)}`}</p>
                <p className="text-sm">{`NAV: ${payload[0]?.value}`}</p>
            </div>
        );
    }
    return null;
};

export function ReturnChart({ data }) {

    const [chartData, setChartData] = useState(filterDataByRange(data, new Date(new Date().setFullYear(new Date().getFullYear() - 1))));

    const getMinValue = () => {
        const values = chartData.map((item) => item.value).filter((v) => v !== undefined && !isNaN(v));
        return values.length > 0 ? Math.min(...values) : 0;
    };

    const handleFilter = (range) => {
        const filteredData = filterDataByRange(data, range);
        setChartData(filteredData);
    };

    return (
        <Card className='p-2'>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Performance Chart</CardTitle>
                <CardDescription className="text-gray-400">Showing NAV trends over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={"var(--rv-secondary)"} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={"var(--rv-secondary)"} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value && value.slice(0, 10)}
                                tick={{ fill: "#D1D5DB" }} // Light gray ticks
                            />
                            <YAxis
                                domain={[getMinValue(), "auto"]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fill: "#D1D5DB" }} // Light gray ticks
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                contentStyle={{ backgroundColor: "var(--rv-secondary)", color: "#ffffff", border: "none", borderRadius: "4px" }}
                                itemStyle={{ color: "#ffffff" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--rv-primary)"
                                strokeWidth={1}
                                fill="url(#gradientFill)"
                                fillOpacity={1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setDate(new Date().getDate() - 7)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        1W
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setMonth(new Date().getMonth() - 1)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        1M
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setMonth(new Date().getMonth() - 6)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        6M
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        1Y
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setFullYear(new Date().getFullYear() - 3)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        3Y
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(new Date(new Date().setFullYear(new Date().getFullYear() - 5)))}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        5Y
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleFilter(null)}
                        className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-600"
                    >
                        Max
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

export const description = "A simple area chart";