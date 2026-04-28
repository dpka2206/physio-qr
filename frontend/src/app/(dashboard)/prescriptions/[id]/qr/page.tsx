'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';

export default function PrescriptionQR({ params }: { params: { id: string } }) {
    const [prescription, setPrescription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAPI(`/prescriptions/${params.id}`);
                setPrescription(data);
            } catch (err: any) {
                setError(err.message || "Prescription not found");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    const handleCopy = async () => {
        if (!prescription?.public_url) return;
        try {
            await navigator.clipboard.writeText(prescription.public_url);
            showToast("Copied link to clipboard!");
        } catch (e) {
            showToast("Failed to copy link");
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full font-bold"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prescription Not Found</h3>
                <p className="text-gray-500 max-w-md">{error}</p>
                <Link href="/dashboard" className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href={`/patients/${prescription.patient_id}`} className="text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 mb-4">
                    <span>&larr;</span> Back to Patient Profile
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Success!</h1>
                <p className="text-gray-500 text-lg mt-2">The prescription for <strong>"{prescription.title}"</strong> has been successfully generated and saved to the cloud.</p>
            </div>

            <div className="bg-white border rounded-2xl p-8 shadow-sm text-center flex flex-col items-center">

                <h2 className="text-xl font-bold text-gray-900 mb-6">Patient Access QR Code</h2>

                <div className="bg-gray-50 p-4 rounded-xl inline-block border border-gray-200 mb-8">
                    {prescription.qr_url ? (
                        <div className="relative">
                            <img src={prescription.qr_url} alt="Prescription QR Code" className="w-64 h-64 object-contain mx-auto mix-blend-multiply" />
                            {/* Download Button Overlaid */}
                            <a
                                href={prescription.qr_url}
                                target="_blank"
                                download={`PhysioQR_${prescription.id}.png`}
                                className="absolute -bottom-2 -right-2 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105"
                                aria-label="Download QR"
                                title="Download QR image"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </a>
                        </div>
                    ) : (
                        <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                    )}
                </div>

                <div className="w-full max-w-md mx-auto space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2 text-left">Or share this direct link via WhatsApp or SMS:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={prescription.public_url || ''}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-3">
                        <Link
                            href={`/patients/${prescription.patient_id}`}
                            className="block w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Done
                        </Link>
                        <Link
                            href={`/patients/${prescription.patient_id}/prescriptions/new`}
                            className="block w-full py-3 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg font-semibold hover:bg-teal-100 transition-colors"
                        >
                            Build Another
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
                You can always access this code later from the patient's profile history.
            </div>
        </div>
    );
}
