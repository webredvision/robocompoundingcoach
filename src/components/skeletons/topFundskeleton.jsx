import React from 'react'

export default function TopFundskeleton() {
    return (
        <div className="animate-pulse">
            {/* Table Skeleton */}
            <table className="min-w-full text-[var(--rv-white)]">
                <thead className="bg-[var(--rv-secondary)] text-sm text-[var(--rv-white)] rounded">
                    <tr>
                        <th className="px-4 py-3 text-left">Fund Name</th>
                        <th className="px-4 py-3 text-right">5-Year Return</th>
                        <th className="px-4 py-3 text-right">Corpus <br />(₹ Cr)</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                        <tr
                            key={idx}
                            className="border-b border-[var(--rv-ternary)]"
                        >
                            <td className="px-4 py-4">
                                <div className="h-8 w-48 bg-gray-600/30 rounded mb-2"></div>
                                <div className="h-5 w-32 bg-gray-600/20 rounded"></div>
                            </td>
                            <td className="px-4 py-8 text-right">
                                <div className="h-8 w-16 bg-gray-600/30 rounded ml-auto"></div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="h-8 w-20 bg-gray-600/30 rounded ml-auto"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
