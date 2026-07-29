"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
    Bold, Italic, Strikethrough, List, ListOrdered, Quote,
    Heading2, Heading3, Link2, ImagePlus, Undo2, Redo2, Loader2,
} from "lucide-react";
import { uploadImage } from "@/lib/upload-image";

interface Props {
    /** Dibaca SEKALI saat editor dibuat. Sengaja tidak dinamai `value`:
     *  ini bukan controlled prop, dan menamainya begitu mengundang orang
     *  menulis useEffect yang memanggil setContent — penyebab kursor lompat. */
    isiAwal: string;
    onChange: (html: string) => void;
    /** Harus salah satu dari ALLOWED_FOLDERS di app/api/upload/route.ts */
    folder: string;
    onError?: (pesan: string) => void;
}

function TombolBar({
    aktif, onClick, judul, disabled, children,
}: {
    aktif?: boolean;
    onClick: () => void;
    judul: string;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={judul}
            aria-label={judul}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                aktif ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
        >
            {children}
        </button>
    );
}

export default function RichEditor({ isiAwal, onChange, folder, onError }: Props) {
    const inputFile = useRef<HTMLInputElement>(null);
    const [mengupload, setMengupload] = useState(false);

    const editor = useEditor({
        // Tiptap 3 sebenarnya sudah otomatis false di Next, tapi ditulis
        // eksplisit supaya tidak ada peringatan di console dan tidak
        // bergantung pada nilai bawaan yang bisa berubah.
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ link: { openOnClick: false } }),
            Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
        ],
        content: isiAwal,
        editorProps: {
            attributes: {
                class: "prose prose-sm prose-teal max-w-none focus:outline-none min-h-64 px-3 py-2.5",
            },
        },
        // Alurnya SATU ARAH: editor -> onChange -> state -> server.
        // Tidak pernah balik. Menyuntik ulang isi ke editor akan membangun
        // ulang dokumennya dan membuang posisi kursor.
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    async function pilihGambar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        // Direset supaya memilih berkas yang sama dua kali tetap memicu onChange.
        e.target.value = "";
        if (!file || !editor) return;

        setMengupload(true);
        try {
            const url = await uploadImage(file, folder);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        } catch (err) {
            onError?.(err instanceof Error ? err.message : "Gagal mengunggah gambar");
        } finally {
            setMengupload(false);
        }
    }

    function aturTautan(ed: Editor) {
        const sekarang = ed.getAttributes("link").href ?? "";
        const url = window.prompt("Alamat tautan (kosongkan untuk menghapus):", sekarang);
        if (url === null) return;
        const rantai = ed.chain().focus().extendMarkRange("link");
        if (url.trim() === "") rantai.unsetLink().run();
        else rantai.setLink({ href: url.trim() }).run();
    }

    // Dengan immediatelyRender: false, editor bernilai null di render pertama —
    // sama di server maupun browser, jadi tidak ada ketidakcocokan hydration.
    if (!editor) {
        return <div className="h-80 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />;
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 transition">
            <div className="border-b border-gray-200 flex flex-wrap gap-0.5 p-1.5 bg-gray-50/60">
                <TombolBar judul="Tebal" aktif={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Miring" aktif={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Coret" aktif={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough className="w-4 h-4" />
                </TombolBar>

                <span className="w-px bg-gray-200 mx-1 my-1" />

                <TombolBar judul="Sub-judul" aktif={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Sub-judul kecil" aktif={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="w-4 h-4" />
                </TombolBar>

                <span className="w-px bg-gray-200 mx-1 my-1" />

                <TombolBar judul="Poin-poin" aktif={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Bernomor" aktif={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Kutipan" aktif={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="w-4 h-4" />
                </TombolBar>

                <span className="w-px bg-gray-200 mx-1 my-1" />

                <TombolBar judul="Tautan" aktif={editor.isActive("link")} onClick={() => aturTautan(editor)}>
                    <Link2 className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Sisipkan gambar" disabled={mengupload} onClick={() => inputFile.current?.click()}>
                    {mengupload ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                </TombolBar>

                <span className="flex-1" />

                <TombolBar judul="Batalkan" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
                    <Undo2 className="w-4 h-4" />
                </TombolBar>
                <TombolBar judul="Ulangi" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
                    <Redo2 className="w-4 h-4" />
                </TombolBar>
            </div>

            <EditorContent editor={editor} />

            <input ref={inputFile} type="file" accept="image/*" onChange={pilihGambar} className="hidden" />
        </div>
    );
}
