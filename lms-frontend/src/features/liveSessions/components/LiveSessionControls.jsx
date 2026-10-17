import { useState } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, Hand, 
  Users, MessageSquare, PhoneOff, StopCircle,
  Maximize, Minimize, LayoutGrid, Maximize2, 
  Smile, Settings, Info, Crop, Expand, Tv
} from 'lucide-react';

const QUICK_REACTIONS = ['👏', '❤️', '👍', '🎉', '😂', '💡'];

export const LiveSessionControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isHandRaised,
  showChat,
  showParticipants,
  isInstructor,
  participantCount = 1,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onLeave,
  onEndSession,
  canPublish = true,
  canPublishVideo = true,
  canShareScreen = true,
  // New Zoom & Google Meet Controls
  layoutMode = 'speaker',
  onToggleLayout,
  aspectFitMode = 'cover',
  onToggleAspectFit,
  isFullscreen = false,
  onToggleFullscreen,
  onSendReaction,
  onOpenSettings,
  onOpenInfo,
  onTogglePiP,
  hasPiP = true,
  unreadCount = 0,
}) => {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const handleSelectReaction = (emoji) => {
    onSendReaction?.(emoji);
    setShowReactionsMenu(false);
  };

  return (
    <footer 
      className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white select-none shrink-0"
      style={{ position: 'relative', zIndex: 30 }}
      role="toolbar"
      aria-label="Classroom Controls"
    >
      {/* Left controls: Participants & Meeting Info */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleParticipants}
          title={showParticipants ? 'Close Participants List' : 'View Participants List'}
          aria-label={`Participants (${participantCount})`}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95 ${
            showParticipants 
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-600/30' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({participantCount})</span>
        </button>

        {onOpenInfo && (
          <button
            type="button"
            onClick={onOpenInfo}
            title="Classroom Information & Link"
            aria-label="Classroom Information"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer active:scale-95"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Center media & interaction controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 relative">
        {/* Microphone Button */}
        {canPublish && (
          <button
            type="button"
            onClick={onToggleAudio}
            title={isAudioEnabled ? 'Mute Microphone (M)' : 'Unmute Microphone (M)'}
            aria-label={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 relative group ${
              isAudioEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/60 ring-2 ring-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-500/50 shadow-lg shadow-rose-600/30'
            }`}
          >
            {isAudioEnabled ? (
              <>
                <Mic className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
              </>
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Camera / Video Button */}
        {canPublish && canPublishVideo && (
          <button
            type="button"
            onClick={onToggleVideo}
            title={isVideoEnabled ? 'Turn Off Camera (V)' : 'Turn On Camera (V)'}
            aria-label={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 relative group ${
              isVideoEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/60 ring-2 ring-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-500/50 shadow-lg shadow-rose-600/30'
            }`}
          >
            {isVideoEnabled ? (
              <>
                <Video className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
              </>
            ) : (
              <VideoOff className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Screen Share Button */}
        {canPublish && canShareScreen && (
          <button
            type="button"
            onClick={onToggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            aria-label={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 relative ${
              isScreenSharing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-600/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white'
            }`}
          >
            <ScreenShare className="w-5 h-5" />
            {isScreenSharing && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-300 animate-ping opacity-75" />
            )}
          </button>
        )}

        {/* Floating Reactions Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReactionsMenu((prev) => !prev)}
            title="Send Live Reaction"
            aria-label="Send Reaction"
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 border border-slate-700/80 ${
              showReactionsMenu 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Quick reactions popup */}
          {showReactionsMenu && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform duration-100 p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hand Raise Button */}
        <button
          type="button"
          onClick={onToggleHand}
          title={isHandRaised ? 'Lower Your Hand' : 'Raise Hand'}
          aria-label={isHandRaised ? 'Lower Your Hand' : 'Raise Hand'}
          className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 relative ${
            isHandRaised
              ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/40 scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-amber-400'
          }`}
        >
          <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
        </button>

        {/* Classroom Chat Button with unread indicator */}
        <button
          type="button"
          onClick={onToggleChat}
          title={showChat ? 'Close Classroom Chat (C)' : 'Open Classroom Chat (C)'}
          aria-label={showChat ? 'Close Classroom Chat' : 'Open Classroom Chat'}
          className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 relative ${
            showChat
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-600/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {!showChat && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* View Switcher: Speaker View ⇋ Gallery Grid View */}
        {onToggleLayout && (
          <button
            type="button"
            onClick={onToggleLayout}
            title={layoutMode === 'grid' ? 'Switch to Speaker View' : 'Switch to Gallery Grid View'}
            aria-label={layoutMode === 'grid' ? 'Switch to Speaker View' : 'Switch to Gallery View'}
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 border border-slate-700/80 ${
              layoutMode === 'grid'
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {layoutMode === 'grid' ? <Maximize2 className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>
        )}

        {/* Aspect Ratio Fill vs Fit Toggle */}
        {onToggleAspectFit && (
          <button
            type="button"
            onClick={onToggleAspectFit}
            title={aspectFitMode === 'cover' ? 'Fit Video to Screen (Contain)' : 'Fill Stage (Cover)'}
            aria-label="Toggle Video Aspect Ratio"
            className={`p-3 rounded-full cursor-pointer transition-all duration-150 active:scale-95 border border-slate-700/80 ${
              aspectFitMode === 'cover'
                ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {aspectFitMode === 'cover' ? <Crop className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Right action controls: PiP, Settings, Fullscreen, Leave */}
      <div className="flex items-center gap-2">
        {/* Picture-in-Picture */}
        {hasPiP && onTogglePiP && (
          <button
            type="button"
            onClick={onTogglePiP}
            title="Picture-in-Picture Mini Player"
            aria-label="Picture-in-Picture"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer active:scale-95 hidden sm:flex"
          >
            <Tv className="w-4 h-4" />
          </button>
        )}

        {/* Device Settings */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title="Audio & Video Settings"
            aria-label="Device Settings"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen Button */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer active:scale-95"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        )}

        {isInstructor && onEndSession && (
          <button
            type="button"
            onClick={onEndSession}
            title="End Session for All Participants"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-all duration-150 active:scale-95"
          >
            <StopCircle className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">End Class</span>
          </button>
        )}

        <button
          type="button"
          onClick={onLeave}
          title="Leave Live Class"
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all duration-150 active:scale-95"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Leave</span>
        </button>
      </div>
    </footer>
  );
};

export default LiveSessionControls;
