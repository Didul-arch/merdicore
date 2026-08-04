export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] pointer-events-none">
      <div className="h-full bg-gradient-to-r from-teal-500 via-sky-400 to-emerald-500 animate-topbar shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
    </div>
  );
}
