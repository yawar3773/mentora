export default function EmeraldSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white-950">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />

        {/* Spinner */}
        <div className="h-20 w-20 rounded-full border-[6px] border-emerald-900 border-t-emerald-400 animate-spin shadow-[0_0_25px_rgba(16,185,129,0.5)]" />

        {/* Inner Dot */}
        <div className="absolute h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
      </div>
    </div>
  );
}
