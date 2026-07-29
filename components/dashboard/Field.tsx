"use client";

const KELAS_INPUT =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition";

export function Field({
  label,
  wajib,
  petunjuk,
  children,
}: {
  label: string;
  wajib?: boolean;
  petunjuk?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {wajib && <span className="text-red-500">*</span>}
      </label>
      {children}
      {petunjuk && <p className="text-[10px] text-gray-400 mt-1">{petunjuk}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${KELAS_INPUT} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${KELAS_INPUT} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${KELAS_INPUT} bg-white cursor-pointer ${props.className ?? ""}`} />;
}

export function FileInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      {...props}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
    />
  );
}
