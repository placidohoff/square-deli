import React from 'react';

export default function LoadingSpinner({ label = 'Loading...' }) {
    return (
        <div className="loading-spinner-wrap">
            <div className="loading-spinner" role="status" aria-label={label} />
            {label && <p className="loading-spinner-label">{label}</p>}
        </div>
    );
}
