import { useState, useEffect, useRef } from 'react';
import { X, Mic, Video, Volume2, Settings2 } from 'lucide-react';

export const LiveDeviceSettingsModal = ({
  isOpen,
  onClose,
}) => {
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedCam, setSelectedCam] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  // Enumerate connected devices
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        const cams = devices.filter((d) => d.kind === 'videoinput');

        setAudioDevices(mics);
        setVideoDevices(cams);

        if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
        if (cams.length > 0 && !selectedCam) setSelectedCam(cams[0].deviceId);
      } catch (e) {
        console.warn('Device enumeration error:', e);
      }
    };

    getDevices();
  }, [isOpen, selectedMic, selectedCam]);

  // Audio level meter using Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    let stream = null;
    const startAudioMeter = async () => {
      try {
        const constraints = selectedMic
          ? { audio: { deviceId: { exact: selectedMic } } }
          : { audio: true };
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((average / 128) * 100));
          setAudioLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      } catch {
        // Fallback simulated meter
        setAudioLevel(15);
      }
    };

    startAudioMeter();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, selectedMic]);

  const handleTestSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 chime
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio test fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Audio & Video Settings</h2>
            <p className="text-xs text-slate-400">Configure your camera, microphone, and speaker</p>
          </div>
        </div>

        <div className="space-y-5 text-xs">
          {/* Microphone Selector */}
          <div>
            <label className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {audioDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Microphone ${i + 1}`}
                </option>
              ))}
              {audioDevices.length === 0 && <option value="">Default System Microphone</option>}
            </select>

            {/* Live Volume Meter Bar */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="text-[10px] text-slate-400">Input Level:</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75 rounded-full"
                  style={{ width: `${Math.max(5, audioLevel)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Camera</span>
            </label>
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {videoDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
              {videoDevices.length === 0 && <option value="">Default Integrated Camera</option>}
            </select>
          </div>

          {/* Speaker Test */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Speaker Output</span>
            </div>
            <button
              type="button"
              onClick={handleTestSound}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium text-xs cursor-pointer"
            >
              Play Test Sound
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveDeviceSettingsModal;
