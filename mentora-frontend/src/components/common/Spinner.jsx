export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Outer Ring */}
        <div className="h-12 w-12 rounded-full border-4 border-gray-200" />

        {/* Animated Ring */}
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin" />
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
        {text}
      </p>
    </div>
  );
}