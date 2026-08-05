"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Loader2, Users, Save } from "lucide-react";
import Toast from "@/components/dashboard/Toast";
import fetcher from "@/lib/swr-fetcher";

interface Perangkat {
    id: number;
    nama: string;
    jabatan: string;
    foto: string | null;
}

function BarisPerangkat({ item }: { item: Perangkat }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 ${isDragging ? "shadow-lg z-10 relative" : ""}`}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="p-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
                title="Geser buat ubah urutan"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {item.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.foto} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-indigo-300" />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.nama}</p>
                <p className="text-[11px] text-gray-400">{item.jabatan}</p>
            </div>
        </div>
    );
}

export default function UrutanPerangkatPage() {
    const { data, isLoading } = useSWR(`/api/perangkat-desa?limit=200`, fetcher, { revalidateOnFocus: false });
    const [items, setItems] = useState<Perangkat[]>([]);
    const [dimuat, setDimuat] = useState(false);
    const [menyimpan, setMenyimpan] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Sinkron sekali aja pas data pertama datang — abis itu urutan dikelola
    // lokal lewat drag, gak boleh ketimpa ulang tiap SWR refetch. Dibandingkan
    // & di-set langsung di render (pola yang sama kayak ImageUploadField),
    // bukan useEffect, biar gak ada rentetan render ekstra.
    if (!dimuat && data?.data) {
        setItems(data.data);
        setDimuat(true);
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        setItems((prev) => {
            const dari = prev.findIndex((i) => i.id === active.id);
            const ke = prev.findIndex((i) => i.id === over.id);
            return arrayMove(prev, dari, ke);
        });
    }

    async function simpanUrutan() {
        setMenyimpan(true);
        try {
            const res = await fetch("/api/perangkat-desa/urutan", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: items.map((i) => i.id) }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Gagal menyimpan urutan");
            setToast({ message: "Urutan berhasil disimpan.", type: "success" });
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Terjadi kesalahan", type: "error" });
        } finally {
            setMenyimpan(false);
        }
    }

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="p-6 md:p-10 space-y-6 max-w-2xl">
                <div>
                    <Link href="/dashboard/perangkat" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 transition mb-3">
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Perangkat
                    </Link>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Atur Urutan Perangkat Desa</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Geser pakai ikon di kiri buat ngatur urutan tampil di halaman publik Profil Desa. Jangan lupa simpan.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-sm text-gray-400 bg-white rounded-2xl border border-gray-200">
                        Belum ada data perangkat desa.
                    </div>
                ) : (
                    <>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <BarisPerangkat key={item.id} item={item} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <button
                            onClick={simpanUrutan}
                            disabled={menyimpan}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                        >
                            {menyimpan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Urutan
                        </button>
                    </>
                )}
            </main>
        </>
    );
}
