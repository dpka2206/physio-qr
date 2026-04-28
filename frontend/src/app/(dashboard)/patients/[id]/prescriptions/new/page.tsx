'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Exercise = {
    id: string;
    name: string;
    body_part: string;
    category: string;
    default_yt_url?: string;
    yt_thumbnail?: string;
};

type PrescriptionExercise = {
    id: string; // unique local ID for drafting
    exercise_id: string;
    name: string;
    body_part: string;
    yt_url: string;
    thumbnail_url: string;
    sets: string;
    reps: string;
    duration_seconds: string;
    doctor_note: string;
};

const SortableItem = ({
    item, index, onUpdate, onRemove
}: {
    item: PrescriptionExercise;
    index: number;
    onUpdate: (id: string, field: string, value: string) => void;
    onRemove: (id: string) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm flex gap-4 items-start relative hover:border-gray-300 transition-colors">
            <div {...attributes} {...listeners} className="cursor-grab p-1.5 text-gray-400 hover:text-gray-600 active:cursor-grabbing hover:bg-gray-100 rounded">
                <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                    <circle cx="2" cy="2" r="2" /><circle cx="10" cy="2" r="2" />
                    <circle cx="2" cy="10" r="2" /><circle cx="10" cy="10" r="2" />
                    <circle cx="2" cy="18" r="2" /><circle cx="10" cy="18" r="2" />
                </svg>
            </div>
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                            <span className="text-gray-400 font-medium">{index + 1}.</span> {item.name}
                        </h4>
                        <div className="mt-1">
                            <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full font-medium shadow-sm">{item.body_part}</span>
                        </div>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Remove exercise">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start">
                    {item.thumbnail_url && (
                        <img src={item.thumbnail_url} alt="Thumbnail" className="w-[120px] h-[68px] object-cover rounded-md shadow-sm border border-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">YouTube URL</label>
                            <input type="text" placeholder="https://youtube.com/..." value={item.yt_url} onChange={(e) => onUpdate(item.id, 'yt_url', e.target.value)} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sets</label>
                            <input type="number" placeholder="e.g. 3" value={item.sets} onChange={(e) => onUpdate(item.id, 'sets', e.target.value)} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none block" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Reps</label>
                            <input type="number" placeholder="e.g. 10" value={item.reps} onChange={(e) => onUpdate(item.id, 'reps', e.target.value)} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none block" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (sec)</label>
                            <input type="number" placeholder="e.g. 30" value={item.duration_seconds} onChange={(e) => onUpdate(item.id, 'duration_seconds', e.target.value)} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none block" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Doctor's Note</label>
                    <textarea
                        placeholder="e.g. Keep knee at 90 degrees, stop if pain occurs"
                        value={item.doctor_note}
                        onChange={(e) => onUpdate(item.id, 'doctor_note', e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
};

export default function PrescriptionBuilder({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<PrescriptionExercise[]>([]);

    const [search, setSearch] = useState('');
    const [bodyPart, setBodyPart] = useState('All');
    const [searchResults, setSearchResults] = useState<Exercise[]>([]);

    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customYt, setCustomYt] = useState('');
    const [customThumb, setCustomThumb] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [customAdding, setCustomAdding] = useState(false);

    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const DRAFT_KEY = `draft_rx_${params.id}`;

    useEffect(() => {
        async function load() {
            try {
                const p = await fetchAPI(`/patients/${params.id}`);
                setPatient(p);
            } catch (e) {
                console.error(e);
            }
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    setTitle(parsed.title || '');
                    setNotes(parsed.notes || '');
                    setItems(parsed.items || []);
                } catch (e) { }
            }
        }
        load();
    }, [params.id, DRAFT_KEY]);

    useEffect(() => {
        if (patient) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, notes, items }));
        }
    }, [title, notes, items, patient, DRAFT_KEY]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                let q = `/exercises?`;
                if (search) q += `q=${encodeURIComponent(search)}&`;
                if (bodyPart !== 'All' && bodyPart !== 'Custom') q += `body_part=${encodeURIComponent(bodyPart)}&`;
                const res = await fetchAPI(q);
                // filter custom if asked (since we don't have category filter natively, but body part 'All'/'Custom')
                let results = res || [];
                if (bodyPart === 'Custom') {
                    results = results.filter((ex: any) => ex.category === 'Custom');
                }
                setSearchResults(results);
            } catch (e) {
                console.error(e);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, bodyPart]);

    const handleAddExercise = (ex: Exercise) => {
        const newItem: PrescriptionExercise = {
            id: crypto.randomUUID(),
            exercise_id: ex.id,
            name: ex.name,
            body_part: ex.body_part || 'Unspecified',
            yt_url: ex.default_yt_url || '',
            thumbnail_url: ex.yt_thumbnail || '',
            sets: '',
            reps: '',
            duration_seconds: '',
            doctor_note: ''
        };
        setItems([...items, newItem]);
    };

    const handleFetchCustomYt = async () => {
        if (!customYt) return;
        try {
            const res = await fetchAPI('/exercises/fetch-yt', {
                method: 'POST',
                body: JSON.stringify({ url: customYt })
            });
            setCustomThumb(res.thumbnail_url);
            setCustomTitle(res.title);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddCustom = async () => {
        if (!customName) return;
        setCustomAdding(true);
        try {
            const res = await fetchAPI('/exercises', {
                method: 'POST',
                body: JSON.stringify({
                    name: customName,
                    default_yt_url: customYt,
                    yt_thumbnail: customThumb,
                    yt_title: customTitle,
                    category: 'Custom'
                })
            });
            handleAddExercise(res);
            setCustomName('');
            setCustomYt('');
            setCustomThumb('');
            setCustomTitle('');
            setShowCustom(false);
        } catch (e) {
            alert("Failed to add custom exercise");
        } finally {
            setCustomAdding(false);
        }
    };

    const updateItem = (id: string, field: string, value: string) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleGenerate = async () => {
        if (!title) {
            setError("Prescription title is required");
            return;
        }
        if (items.length === 0) {
            setError("Please add at least one exercise");
            return;
        }
        setError('');
        setGenerating(true);

        try {
            const payload = {
                patient_id: params.id,
                title,
                notes,
                exercises: items.map((item, index) => ({
                    exercise_id: item.exercise_id,
                    order_index: index,
                    sets: item.sets ? parseInt(item.sets) : null,
                    reps: item.reps ? parseInt(item.reps) : null,
                    duration_seconds: item.duration_seconds ? parseInt(item.duration_seconds) : null,
                    yt_url: item.yt_url || null,
                    doctor_note: item.doctor_note || null
                }))
            };
            const res = await fetchAPI('/prescriptions', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            localStorage.removeItem(DRAFT_KEY);
            // On success redirect to qr page or just view
            // Backend returns new_p that has id
            router.push(`/patients/${params.id}`); // Or where patient's rx live. Wait, user said `redirect to /prescriptions/{id}/qr` but we haven't built that page. Let's redirect to patient detail for now.
            // Wait, prompt: "router.push(`/prescriptions/{id}/qr`)" - I will assume that page will exist or isn't strictly requested to be built in this prompt. I'll redirect to it.
            router.push(`/prescriptions/${res.id}/qr`);
        } catch (e: any) {
            setError(e.message || "Failed to generate");
            setGenerating(false);
        }
    };

    const filters = ['All', 'Knee', 'Shoulder', 'Hip', 'Lower Back', 'Core', 'Neck', 'Lower Body', 'Custom'];

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50 -m-8">
            {/* -m-8 compensates for layout padding if needed. We'll just assume standard full height component */}

            {/* LEFT PANEL */}
            <div className="w-full lg:w-[60%] p-8 flex flex-col gap-8 bg-white border-r overflow-y-auto" style={{ maxHeight: '100vh' }}>
                <div>
                    <label className="block text-sm uppercase tracking-wide font-bold text-gray-500 mb-2">Prescription Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Post ACL Repair — Week 2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border-b-2 border-dashed border-gray-300 focus:border-teal-500 focus:outline-none text-2xl font-semibold text-gray-900 bg-transparent placeholder-gray-300 transition-colors"
                    />
                </div>

                <div className="bg-gray-50 p-5 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-4">Exercise Library</h3>
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 mb-4 shadow-sm"
                    />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setBodyPart(f)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${bodyPart === f ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-inner divide-y divide-gray-100">
                        {searchResults.length === 0 ? <p className="p-6 text-gray-500 text-sm text-center">No exercises found.</p> : searchResults.map(ex => (
                            <div key={ex.id} className="flex justify-between items-center p-3 hover:bg-teal-50 group transition-colors">
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900 group-hover:text-teal-900">{ex.name}</p>
                                    <p className="text-xs text-gray-500">{ex.body_part} • {ex.category}</p>
                                </div>
                                <button onClick={() => handleAddExercise(ex)} className="text-teal-600 bg-white hover:bg-teal-600 hover:text-white px-3 py-1 rounded border border-teal-600 transition-colors text-sm font-medium">Add</button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5">
                        {!showCustom ? (
                            <button onClick={() => setShowCustom(true)} className="text-sm font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1"><span className="text-lg leading-none">+</span> Add custom exercise</button>
                        ) : (
                            <div className="p-5 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col gap-4 relative">
                                <button onClick={() => setShowCustom(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">×</button>
                                <p className="font-semibold text-sm text-gray-900">New Custom Exercise</p>
                                <input type="text" placeholder="Exercise name *" value={customName} onChange={e => setCustomName(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                                <input type="text" placeholder="YouTube URL" value={customYt} onChange={e => setCustomYt(e.target.value)} onBlur={handleFetchCustomYt} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                                {customThumb && (
                                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                                        <img src={customThumb} className="w-16 h-10 object-cover rounded shadow-sm" alt="yt preview" />
                                        <span className="text-xs font-medium text-gray-700 line-clamp-2">{customTitle}</span>
                                    </div>
                                )}
                                <div className="flex gap-3 pt-1">
                                    <button disabled={customAdding} onClick={handleAddCustom} className="flex-1 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">Add to prescription</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-4 flex justify-between items-end border-b pb-2">
                        <span>Selected Exercises</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{items.length} items</span>
                    </h3>

                    <div className="flex-1 min-h-[200px]">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-500 font-medium">No exercises selected</p>
                                <p className="text-gray-400 text-sm mt-1">Search and add exercises from the library above.</p>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {items.map((item, index) => (
                                        <SortableItem key={item.id} item={item} index={index} onUpdate={updateItem} onRemove={removeItem} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">General Instructions</label>
                    <textarea
                        value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="General prescription notes for the patient..."
                        rows={3}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    />
                </div>
            </div>

            {/* RIGHT PANEL - PREVIEW */}
            <div className="w-full lg:w-[40%] bg-gray-50 flex flex-col h-full border-l border-gray-200">
                <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                    <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Patient Preview</h2>

                    <div className="bg-white border p-8 rounded-2xl shadow-sm flex-1 flex flex-col relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full opacity-50 -z-0"></div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2 break-words">{title || <span className="text-gray-300 italic">Untitled Prescription</span>}</h3>
                            <p className="text-gray-500 font-medium mb-8">For {patient?.full_name || <span className="text-gray-300 italic">Patient Name</span>}</p>

                            <div className="space-y-6">
                                {items.length === 0 ? <p className="text-sm text-gray-400 italic text-center py-10">Exercises will preview here</p> : null}
                                {items.map((item, i) => (
                                    <div key={i} className="flex gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                                        <div className="font-bold text-teal-200 text-xl w-6 shrink-0">{i + 1}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 leading-snug">{item.name}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.sets && <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.sets} Sets</span>}
                                                {item.reps && <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.reps} Reps</span>}
                                                {item.duration_seconds && <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.duration_seconds} Secs</span>}
                                            </div>
                                            {item.doctor_note && <p className="text-sm text-blue-900 bg-blue-50/80 px-3 py-2 mt-3 rounded-lg border border-blue-100">{item.doctor_note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {notes && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Instructions</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-10 text-center opacity-40 grayscale pointer-events-none pb-4">
                            <div className="w-24 h-24 mx-auto border-4 border-gray-200 rounded grid grid-cols-2 gap-1 p-1 mb-2">
                                <div className="bg-gray-300 rounded-sm"></div>
                                <div className="bg-gray-300 rounded-sm"></div>
                                <div className="bg-gray-300 rounded-sm"></div>
                                <div className="bg-gray-300 rounded-sm"></div>
                            </div>
                            <p className="text-xs font-bold text-gray-400">QR CODE PLACEHOLDER</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-gray-200 shrink-0">
                    {error && <div className="text-sm text-red-600 font-medium mb-3 text-center">{error}</div>}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {generating ? (
                            <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> Generating...</>
                        ) : 'Generate QR Code'}
                    </button>
                </div>
            </div>
        </div>
    );
}
