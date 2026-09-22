export const LiveFloatingReactions = ({ reactions = [] }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-16 text-3xl sm:text-4xl animate-float-up select-none filter drop-shadow-md"
          style={{
            left: `${r.left || 50}%`,
            animationDuration: `${r.duration || 2.8}s`,
          }}
        >
          <span>{r.emoji}</span>
          {r.sender && (
            <span className="block text-[10px] text-white/90 bg-slate-900/80 px-1.5 py-0.5 rounded-full text-center mt-1 font-medium shadow-sm truncate max-w-[80px]">
              {r.sender}
            </span>
          )}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.6) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translateY(0px) scale(1.1) rotate(-5deg);
          }
          50% {
            opacity: 0.9;
            transform: translateY(-140px) scale(1.0) rotate(5deg);
          }
          85% {
            opacity: 0.6;
            transform: translateY(-280px) scale(0.95) rotate(-3deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-380px) scale(0.7) rotate(0deg);
          }
        }
        .animate-float-up {
          animation: floatUp 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LiveFloatingReactions;
