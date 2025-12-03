
import React from 'react';

export const Spinner: React.FC = () => {
    return (
        <div 
            className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};
