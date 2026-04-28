'use client';

import React from 'react';

interface QRDisplayProps {
    url: string;
    size?: number;
}

export default function QRDisplay({ url, size = 240 }: QRDisplayProps) {
    const downloadQR = async () => {
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            const objUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = 'prescription_qr.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(objUrl);
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-center mb-4"
                style={{ width: size, height: size }}
            >
                {url ? (
                    <img src={url} alt="Prescription QR Code" className="w-full h-full object-contain" />
                ) : (
                    <div className="text-gray-400 text-sm font-medium">No QR available</div>
                )}
            </div>
            <button
                onClick={downloadQR}
                disabled={!url}
                className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50"
            >
                Download PNG
            </button>
        </div>
    );
}
