import React, { useEffect, useState } from 'react';
import { DELI_API_ROOT } from '../../Constants';
import { getAuthToken, handleUnauthorized } from '../../utils/authToken';

const API_URL = `${DELI_API_ROOT}/api/settings/tv-mode`;

// Admin control for the in-store TV display behavior on /sandwiches and
// /items (wake lock + fullscreen prompt + on-page motion) — see
// src/utils/useTvDisplayMode.js. Off by default; this is the only way to
// turn it on, and it's remote: an already-open TV tab picks up the change
// on its own next poll, no reload needed on the TV itself.
export default function TvModeToggle() {
    const [enabled, setEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setEnabled(!!data.enabled))
            .catch((err) => console.error('Error fetching TV display mode:', err));
    }, []);

    const toggle = () => {
        const next = !enabled;
        setIsSaving(true);

        fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({ enabled: next }),
        })
            .then((res) => {
                if (res.status === 401) { handleUnauthorized(); return; }
                if (!res.ok) throw new Error('Failed to update TV display mode');
                return res.json();
            })
            .then((data) => { if (data) setEnabled(data.enabled); })
            .catch((err) => {
                console.error(err);
                alert('Could not update TV display mode. Please try again.');
            })
            .finally(() => setIsSaving(false));
    };

    return (
        <div className="tv-mode-toggle">
            <div>
                <div className="tv-mode-toggle-label">TV display mode</div>
                <div className="tv-mode-toggle-hint">
                    Keeps /sandwiches and /items awake, fullscreen, and idle-proof on the in-store TVs.
                </div>
            </div>
            <button
                type="button"
                className={`tv-mode-toggle-switch${enabled ? ' on' : ''}`}
                role="switch"
                aria-checked={enabled}
                disabled={isSaving}
                onClick={toggle}
            >
                <span className="tv-mode-toggle-knob" />
            </button>
        </div>
    );
}
