import { MicOff, Hand } from 'lucide-react';

export const LiveGalleryGrid = ({
  participants = [],
  isInstructor,
  localVideoRef,
  remoteVideoRef,
  remoteImgRef,
  remoteStreamActive,
  isVideoEnabled,
  isScreenSharing,
  aspectFitMode = 'cover',
  onSelectParticipant,
}) => {
  const getGridCols = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className={`w-full h-full p-4 grid ${getGridCols(participants.length)} gap-4 items-center justify-center overflow-y-auto`}>
      {participants.map((p) => {
        const isLocalHost = p.isLocal && isInstructor;
        const isRemoteHost = !p.isLocal && p.isInstructor;

        return (
          <div
            key={p.identity}
            onClick={() => onSelectParticipant?.(p)}
            className="w-full h-full min-h-[220px] max-h-[480px] relative rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 shadow-xl flex items-center justify-center cursor-pointer group transition-all hover:border-indigo-500/50"
          >
            {/* Local Host Video */}
            {isLocalHost && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full ${
                  aspectFitMode === 'contain' ? 'object-contain' : 'object-cover'
                } ${!isScreenSharing ? '-scale-x-100' : ''} ${(isVideoEnabled || isScreenSharing) ? 'block' : 'hidden'}`}
              />
            )}

            {/* Remote Host Video / Frame Feed */}
            {isRemoteHost && (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full z-0 ${
                    aspectFitMode === 'contain' ? 'object-contain' : 'object-cover'
                  } ${remoteStreamActive ? 'block' : 'hidden'}`}
                />
                <img
                  ref={remoteImgRef}
                  alt={p.name}
                  className={`absolute inset-0 w-full h-full z-10 ${
                    aspectFitMode === 'contain' ? 'object-contain' : 'object-cover'
                  } ${remoteStreamActive ? 'block' : 'hidden'}`}
                />
              </>
            )}

            {/* Avatar when video is off */}
            {((isLocalHost && !isVideoEnabled && !isScreenSharing) ||
              (isRemoteHost && !remoteStreamActive) ||
              (!p.isInstructor)) && (
              <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-slate-800">
                  {p.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-slate-300 truncate max-w-[160px]">
                  {p.name}
                </span>
              </div>
            )}

            {/* Bottom info pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-white shadow-md z-20">
              <span className="font-semibold truncate max-w-[120px]">{p.name}</span>
              {p.isInstructor && <span className="text-indigo-400 font-bold">• Host</span>}
              {p.isLocal && <span className="text-slate-400 text-[10px]">(You)</span>}
              {!p.isAudioEnabled && <MicOff className="w-3.5 h-3.5 text-rose-400 ml-0.5" />}
              {p.isHandRaised && (
                <span className="flex items-center gap-0.5 text-amber-400 font-semibold text-[10px] ml-1">
                  <Hand className="w-3 h-3" /> Hand
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveGalleryGrid;
