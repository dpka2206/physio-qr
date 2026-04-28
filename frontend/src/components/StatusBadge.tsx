import React from 'react';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const s = status.toLowerCase();
    let colorClass = 'bg-gray-100 text-gray-800';

    if (s === 'active') colorClass = 'bg-teal-100 text-teal-800';
    if (s === 'expired') colorClass = 'bg-gray-200 text-gray-600';
    if (s === 'archived') colorClass = 'bg-red-100 text-red-800';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded capitalize text-xs font-medium ${colorClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
