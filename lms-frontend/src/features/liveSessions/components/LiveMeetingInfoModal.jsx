import { useState } from 'react';
import { Copy, Check, X, Shield, Users, Calendar, Link as LinkIcon } from 'lucide-react';

export const LiveMeetingInfoModal = ({
  isOpen,
  onClose,
  roomName,
  participantCount = 1,
  hostName = 'Instructor',
  sessionId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const meetingUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{roomName}</h2>
            <p className="text-xs text-slate-400">Classroom Joining Information</p>
          </div>
        </div>

        <div className="space-y-3 text-xs mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Host / Instructor</span>
            </div>
            <span className="font-semibold text-white">{hostName}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Active Attendees</span>
            </div>
            <span className="font-semibold text-white">{participantCount}</span>
          </div>

          {sessionId && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block mb-1">Session ID</span>
              <span className="font-mono text-slate-200 text-[11px] select-all break-all">{sessionId}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Classroom Link</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={meetingUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-300 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMeetingInfoModal;
