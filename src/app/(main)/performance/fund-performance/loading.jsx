import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

function Loading({ items }) {
    return (
        <div className="items-center">
            {Array.from({ length: items }).map((_, index) => (
                <Skeleton className="h-16 w-full rounded mb-2" key={index} />
            ))}
        </div>
    );
}

export default Loading;
