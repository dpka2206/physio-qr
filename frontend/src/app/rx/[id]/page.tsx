'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Custom lightweight fetch to avoid auth wrappers
async function fetchPublicRX(id: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${API_URL}/rx/${id}`);
    if (!res.ok) {
        if (res.status === 404) throw new Error("404");
        throw new Error("Failed to load");
    }
    return res.json();
}

function ExerciseCard({ item, index }: { item: any, index: number }) {
    const [done, setDone] = useState(false);
    const ex = item.exercises || {};

    return (
        <div className={`p-5 rounded-xl border transition-colors ${done ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex gap-4 mb-4">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${done ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold ${done ? 'text-gray-600 line-through' : 'text-gray-900'} leading-snug`}>{ex.name}</h3>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {item.sets && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{item.sets} sets</span>}
                        {item.reps && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{item.reps} reps</span>}
                        {item.duration_seconds && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{item.duration_seconds} sec</span>}
                    </div>
                </div>
            </div>

            {(item.yt_url || ex.default_yt_url) && (
                <a
                    href={item.yt_url || ex.default_yt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 mb-4 bg-gray-100"
                >
                    <Image
                        src={ex.yt_thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"}
                        alt={ex.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                        unoptimized={true} // In case external URLs aren't configured in next.config.mjs
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                        </div>
                    </div>
                </a>
            )}

            {item.doctor_note && (
                <div className="mb-4 p-4 bg-gray-50 border-l-4 border-teal-500 rounded-r-lg">
                    <p className="text-gray-700 text-base leading-relaxed">{item.doctor_note}</p>
                </div>
            )}

            <button
                onClick={() => setDone(!done)}
                className={`w-full py-3.5 rounded-lg border text-base font-semibold transition-colors flex justify-center items-center gap-2 ${done
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
            >
                {done ? (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Done</>
                ) : 'Mark as done'}
            </button>
        </div>
    );
}

export default function RxPage({ params }: { params: { id: string } }) {
    const [rx, setRx] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchPublicRX(params.id);
                setRx(data);
            } catch (err: any) {
                setErrorStatus(err.message === "404" ? 404 : 500);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    if (loading) {
        return <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto animate-pulse flex flex-col gap-6">
            <div className="h-10 bg-gray-100 rounded-full w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
            <div className="h-48 bg-gray-100 rounded-xl w-full mt-8"></div>
            <div className="h-48 bg-gray-100 rounded-xl w-full"></div>
        </div>;
    }

    if (errorStatus === 404 || !rx) {
        return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescription not found</h1>
            <p className="text-gray-500 text-lg">This prescription link is no longer valid.</p>
        </div>;
    }

    if (rx.status === 'archived' || rx.status === 'expired') {
        return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Prescription Unavailable</h1>
            <p className="text-gray-500 text-lg">This prescription has been deactivated by your physiotherapist.</p>
        </div>;
    }

    const doctorName = rx.doctors?.full_name || 'PhysioQR Doctor';
    const clinicName = rx.doctors?.clinic_name || 'PhysioQR Clinic';

    return (
        <div className="max-w-xl mx-auto pb-12">
            <header className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">{clinicName}</span>
                    <span className="text-gray-500">Prescribed by Dr. {doctorName}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    {new Date(rx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>

            <main className="px-5 pt-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 leading-tight text-balance">
                    {rx.title}
                </h1>

                {rx.notes && (
                    <div className="mb-10 bg-teal-50 border-l-4 border-teal-500 p-5 rounded-r-xl">
                        <p className="text-teal-900 text-lg leading-relaxed whitespace-pre-wrap">{rx.notes}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {rx.exercises?.map((item: any, i: number) => (
                        <ExerciseCard key={item.id} item={item} index={i} />
                    ))}
                </div>
            </main>

            <footer className="mt-16 border-t border-gray-100 pt-8 px-5 text-center px-4">
                <p className="text-gray-400 text-sm mb-2">This prescription was generated by PhysioQR.</p>
                <a href="https://physioqr.app" className="text-teal-600 font-medium text-sm hover:underline">physioqr.app</a>
            </footer>
        </div>
    );
}
