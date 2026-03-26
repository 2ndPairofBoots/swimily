export default function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] flex items-center justify-center">
      <span className="text-white/80 light:text-gray-900 font-semibold">{label}</span>
    </div>
  );
}

