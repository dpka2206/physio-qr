'use client';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

export default function ExercisesLibrary() {
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function loadExercises() {
        try {
            const data = await fetchAPI('/exercises');
            setExercises(data);
        } catch (err: any) {
            showToast("Failed to load exercises");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadExercises();
    }, []);

    async function handleCreateExercise(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetchAPI('/exercises', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    youtube_url: youtubeUrl
                })
            });
            showToast("Exercise added to library successfully!");
            setIsModalOpen(false);
            setTitle('');
            setDescription('');
            setYoutubeUrl('');
            await loadExercises();
        } catch (err: any) {
            showToast(err.message || "Failed to add exercise");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 w-48 bg-gray-100 rounded-md"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-50 rounded-xl"></div>
                    <div className="h-64 bg-gray-50 rounded-xl"></div>
                    <div className="h-64 bg-gray-50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-900">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Therapy Exercises</h2>
                    <p className="text-sm text-gray-500">Your total clinic library of {exercises.length} available exercises.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    + Add Custom Exercise
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-900">
                {exercises.map((ex) => (
                    <div key={ex.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            {ex.thumbnail_url ? (
                                <img src={ex.thumbnail_url} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{ex.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{ex.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {exercises.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 border rounded-xl border-dashed">
                        <p className="text-gray-500 font-medium">No exercises found.</p>
                        <p className="text-sm text-gray-400 mt-1">Add some custom exercises or ensure seeding script ran properly.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="border-b px-6 py-4 flex justify-between items-center text-gray-900">
                            <h3 className="text-lg font-bold">Add Custom Exercise</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateExercise} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Title</label>
                                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Thoracic Extension" className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                                <input required type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900" />
                                <p className="text-xs text-gray-500 mt-1">Provide any valid YouTube link. OEmbed data will extract thumbnails automatically.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Description</label>
                                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Patient instructions..." className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900"></textarea>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                                <button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {submitting ? 'Adding...' : 'Save Exercise'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
