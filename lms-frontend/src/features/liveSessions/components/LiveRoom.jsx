import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Room, RoomEvent, Track, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client';
import { 
  VideoOff, MicOff, ScreenShare, Hand, 
  MessageSquare, Users, Send, Wifi, Shield, X, CheckCircle2, AlertTriangle, Info,
  VolumeX, Maximize, Minimize, Crop, Expand, Clock
} from 'lucide-react';
import liveSessionApi from '../api/liveSessionApi';
import LiveSessionControls from './LiveSessionControls';
import LiveFloatingReactions from './LiveFloatingReactions';
import LiveMeetingInfoModal from './LiveMeetingInfoModal';
import LiveDeviceSettingsModal from './LiveDeviceSettingsModal';
import LiveGalleryGrid from './LiveGalleryGrid';

export const LiveRoom = ({
  sessionId,
  serverUrl,
  token,
  roomName,
  participantName,
  participantIdentity,
  isInstructor,
  onLeave,
  onEndSession,
}) => {
  const myId = useMemo(() => participantIdentity || participantName, [participantIdentity, participantName]);

  const [room, setRoom] = useState(null);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);

  // Local media states
  const [isAudioEnabled, setIsAudioEnabled] = useState(isInstructor);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isInstructor);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // View Layout: 'speaker' vs 'grid'
  const [layoutMode, setLayoutMode] = useState('speaker');

  // Video Aspect Ratio Fit Mode: 'cover' (Fill) vs 'contain' (Fit)
  const [aspectFitMode, setAspectFitMode] = useState('cover');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Active sidebar: 'chat' | 'participants' | null
  const [activeSidebar, setActiveSidebar] = useState('chat');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Session elapsed timer (seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Floating live emoji reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Interactive feedback toast
  const [toastNotification, setToastNotification] = useState(null);
  const toastTimerRef = useRef(null);

  // Remote participants from LiveKit or Peer Sync
  const [remotePeers, setRemotePeers] = useState({});
  const [dbAttendance, setDbAttendance] = useState([]);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);

  // Classroom chat messages
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'System',
      text: `Welcome to ${roomName}! Live class has started.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Media stream and DOM references
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteImgRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Live Canvas frame streaming references for zero-failure local playback
  const frameCanvasRef = useRef(null);
  const frameIntervalRef = useRef(null);

  // Peer Connection references for local WebRTC mesh
  const channelRef = useRef(null);
  const peerConnectionsRef = useRef({});

  // Dynamic state ref to keep BroadcastChannel stable across re-renders
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {
      myId,
      participantName,
      isInstructor,
      isVideoEnabled,
      isAudioEnabled,
      isHandRaised,
      isScreenSharing,
      remotePeers,
      activeSidebar,
    };
  }, [myId, participantName, isInstructor, isVideoEnabled, isAudioEnabled, isHandRaised, isScreenSharing, remotePeers, activeSidebar]);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastNotification({ id: Date.now(), message, type });
    toastTimerRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  }, []);

  // Format elapsed time as HH:MM:SS or MM:SS
  const formattedTime = useMemo(() => {
    const hrs = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Session elapsed timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Native Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Compute unified participants list
  const participants = useMemo(() => {
    const list = [];

    // Add self
    list.push({
      identity: myId,
      name: participantName,
      isLocal: true,
      isInstructor,
      isHandRaised,
      isVideoEnabled,
      isAudioEnabled,
    });

    // Add remote peers from BroadcastChannel / LiveKit
    Object.values(remotePeers).forEach((peer) => {
      if (peer.id !== myId && !list.some((p) => p.identity === peer.id)) {
        list.push({
          identity: peer.id,
          name: peer.name,
          isLocal: false,
          isInstructor: peer.isInstructor,
          isHandRaised: peer.isHandRaised,
          isVideoEnabled: peer.isVideoEnabled,
          isAudioEnabled: peer.isAudioEnabled,
        });
      }
    });

    // Merge database attendance records
    dbAttendance.forEach((att) => {
      const attId = String(att.userId || att.id);
      const attName = att.userName || att.userEmail || 'Student';
      const exists = list.some(
        (p) => p.identity === attId || p.name.toLowerCase() === attName.toLowerCase()
      );
      if (!exists) {
        list.push({
          identity: attId,
          name: attName,
          isLocal: false,
          isInstructor: false,
          isHandRaised: false,
          isVideoEnabled: false,
          isAudioEnabled: false,
        });
      }
    });

    // Sort: Instructors first, then local, then alphabetically
    return list.sort((a, b) => {
      if (a.isInstructor && !b.isInstructor) return -1;
      if (!a.isInstructor && b.isInstructor) return 1;
      if (a.isLocal) return -1;
      if (b.isLocal) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [myId, participantName, isInstructor, isHandRaised, isVideoEnabled, isAudioEnabled, remotePeers, dbAttendance]);

  // Determine who is presenting on the main stage
  const activePresenter = useMemo(() => {
    if (isInstructor) {
      return {
        name: participantName,
        isInstructor: true,
        isLocal: true,
        identity: myId,
      };
    }
    const host = participants.find((p) => p.isInstructor);
    if (host) {
      return host;
    }
    return {
      name: 'Class Host',
      isInstructor: true,
      isLocal: false,
      identity: 'host',
    };
  }, [isInstructor, participantName, myId, participants]);

  // Send Floating Live Emoji Reaction
  const handleSendReaction = useCallback((emoji) => {
    const reactionObj = {
      id: String(Date.now()) + Math.random(),
      emoji,
      sender: participantName,
      left: Math.floor(Math.random() * 60) + 20, // 20% to 80% horizontal offset
      duration: 2.8,
    };

    setFloatingReactions((prev) => [...prev, reactionObj]);

    // Broadcast reaction
    channelRef.current?.postMessage({
      type: 'REACTION',
      reaction: reactionObj,
    });

    if (room?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'REACTION', reaction: reactionObj });
        room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: false });
      } catch (e) {
        console.warn('LiveKit reaction error:', e);
      }
    }

    // Auto cleanup floating reaction after animation
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionObj.id));
    }, 3000);
  }, [participantName, room]);

  // Picture-in-Picture mode toggle
  const handleTogglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const video = isInstructor ? localVideoRef.current : remoteVideoRef.current;
        if (video) {
          await video.requestPictureInPicture();
        }
      }
    } catch (e) {
      console.warn('PiP error:', e);
      showToast('Picture-in-Picture unavailable', 'info');
    }
  }, [isInstructor, showToast]);

  // Host "Mute All" action
  const handleMuteAll = useCallback(() => {
    if (!isInstructor) return;
    channelRef.current?.postMessage({
      type: 'HOST_MUTE_ALL',
      senderId: myId,
    });
    showToast('Sent Mute All request to attendees', 'info');
  }, [isInstructor, myId, showToast]);

  // Frame broadcasting for immediate in-memory multi-tab video streaming
  const startFrameBroadcast = useCallback(() => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    if (!frameCanvasRef.current) {
      frameCanvasRef.current = document.createElement('canvas');
    }

    const canvas = frameCanvasRef.current;

    frameIntervalRef.current = setInterval(() => {
      const video = localVideoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        try {
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 360;
          if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw;
            canvas.height = vh;
          }
          const ctx = canvas.getContext('2d', { alpha: false });
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          channelRef.current?.postMessage({
            type: 'VIDEO_FRAME',
            senderId: myId,
            frame: dataUrl,
          });
        } catch {
          // ignore
        }
      }
    }, 55);
  }, [myId]);

  const stopFrameBroadcast = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  // WebRTC Signaling Handlers
  const startPeerConnection = useCallback(async (peerId, streamToShare) => {
    try {
      const stream = streamToShare || localStreamRef.current;
      if (!stream) return;

      if (peerConnectionsRef.current[peerId]) {
        peerConnectionsRef.current[peerId].close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      peerConnectionsRef.current[peerId] = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate && channelRef.current) {
          channelRef.current.postMessage({
            type: 'RTC_ICE',
            candidate: e.candidate.toJSON(),
            senderId: myId,
            targetId: peerId,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      channelRef.current?.postMessage({
        type: 'RTC_OFFER',
        offer: { type: offer.type, sdp: offer.sdp },
        senderId: myId,
        targetId: peerId,
      });
    } catch (e) {
      console.warn('WebRTC peer offer error:', e);
    }
  }, [myId]);

  const handleRtcOffer = useCallback(async (data) => {
    try {
      if (data.targetId && data.targetId !== myId) return;

      if (peerConnectionsRef.current[data.senderId]) {
        peerConnectionsRef.current[data.senderId].close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      peerConnectionsRef.current[data.senderId] = pc;

      pc.ontrack = (event) => {
        const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play()
            .then(() => setRemoteStreamActive(true))
            .catch(() => setRemoteStreamActive(true));
        } else {
          setRemoteStreamActive(true);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && channelRef.current) {
          channelRef.current.postMessage({
            type: 'RTC_ICE',
            candidate: e.candidate.toJSON(),
            senderId: myId,
            targetId: data.senderId,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channelRef.current?.postMessage({
        type: 'RTC_ANSWER',
        answer: { type: answer.type, sdp: answer.sdp },
        senderId: myId,
        targetId: data.senderId,
      });
    } catch (e) {
      console.warn('WebRTC answer error:', e);
    }
  }, [myId]);

  const handleRtcAnswer = useCallback(async (data) => {
    try {
      if (data.targetId && data.targetId !== myId) return;
      const pc = peerConnectionsRef.current[data.senderId];
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    } catch (e) {
      console.warn('WebRTC set remote description error:', e);
    }
  }, [myId]);

  const handleRtcIce = useCallback(async (data) => {
    try {
      if (data.targetId && data.targetId !== myId) return;
      const pc = peerConnectionsRef.current[data.senderId];
      if (pc && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (e) {
      console.warn('WebRTC add ICE candidate error:', e);
    }
  }, [myId]);

  // Scroll chat on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll backend attendance every 5 seconds
  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    const fetchAttendance = async () => {
      try {
        const res = await liveSessionApi.getSessionAttendance(sessionId);
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && Array.isArray(list)) {
          setDbAttendance(list.filter((a) => !a.leftAt));
        }
      } catch {
        // Attendance polling fallback
      }
    };

    fetchAttendance();
    const timer = setInterval(fetchAttendance, 5000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  // BroadcastChannel & Realtime Events
  useEffect(() => {
    const channelName = `lms-live-room-${sessionId || 'default'}`;
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    // Announce presence on join
    channel.postMessage({
      type: 'PEER_JOIN',
      peer: {
        id: myId,
        name: stateRef.current.participantName,
        isInstructor: stateRef.current.isInstructor,
        isVideoEnabled: stateRef.current.isVideoEnabled,
        isAudioEnabled: stateRef.current.isAudioEnabled,
        isHandRaised: stateRef.current.isHandRaised,
        isScreenSharing: stateRef.current.isScreenSharing,
      },
    });

    const handlePeerMessage = async (event) => {
      const data = event.data;
      if (!data || data.senderId === myId) return;

      switch (data.type) {
        case 'PEER_JOIN': {
          if (data.peer && data.peer.id !== myId) {
            setRemotePeers((prev) => ({
              ...prev,
              [data.peer.id]: { ...data.peer, lastSeen: Date.now() },
            }));

            channel.postMessage({
              type: 'PEER_SYNC',
              peer: {
                id: myId,
                name: stateRef.current.participantName,
                isInstructor: stateRef.current.isInstructor,
                isVideoEnabled: stateRef.current.isVideoEnabled,
                isAudioEnabled: stateRef.current.isAudioEnabled,
                isHandRaised: stateRef.current.isHandRaised,
                isScreenSharing: stateRef.current.isScreenSharing,
              },
            });

            showToast(`${data.peer.name} joined the live class`, 'info');

            if (stateRef.current.isInstructor && localStreamRef.current && (stateRef.current.isVideoEnabled || stateRef.current.isScreenSharing)) {
              startPeerConnection(data.peer.id, localStreamRef.current);
              startFrameBroadcast();
            }
          }
          break;
        }

        case 'PEER_SYNC': {
          if (data.peer && data.peer.id !== myId) {
            setRemotePeers((prev) => ({
              ...prev,
              [data.peer.id]: { ...data.peer, lastSeen: Date.now() },
            }));
          }
          break;
        }

        case 'PEER_HEARTBEAT': {
          if (data.peer && data.peer.id !== myId) {
            setRemotePeers((prev) => ({
              ...prev,
              [data.peer.id]: { ...prev[data.peer.id], ...data.peer, lastSeen: Date.now() },
            }));
          }
          break;
        }

        case 'PEER_LEAVE': {
          if (data.id) {
            setRemotePeers((prev) => {
              const updated = { ...prev };
              delete updated[data.id];
              return updated;
            });
            showToast(`${data.name || 'A participant'} left the live class`, 'info');
          }
          break;
        }

        case 'CHAT': {
          if (data.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });

            if (stateRef.current.activeSidebar !== 'chat') {
              setUnreadChatCount((c) => c + 1);
            }
          }
          break;
        }

        case 'REACTION': {
          if (data.reaction) {
            setFloatingReactions((prev) => [...prev, data.reaction]);
            setTimeout(() => {
              setFloatingReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
            }, 3000);
          }
          break;
        }

        case 'HAND_RAISE': {
          if (data.senderId && data.senderId !== myId) {
            setRemotePeers((prev) => {
              if (!prev[data.senderId]) return prev;
              return {
                ...prev,
                [data.senderId]: { ...prev[data.senderId], isHandRaised: data.raised },
              };
            });

            if (stateRef.current.isInstructor && data.raised) {
              showToast(`✋ ${data.sender} raised their hand`, 'warning');
            }

            setMessages((prev) => [
              ...prev,
              {
                id: String(Date.now()) + Math.random(),
                sender: 'Classroom',
                text: data.raised ? `✋ ${data.sender} raised their hand.` : `${data.sender} lowered hand.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true,
              },
            ]);
          }
          break;
        }

        case 'HOST_MUTE_ALL': {
          if (!stateRef.current.isInstructor) {
            setIsAudioEnabled(false);
            showToast('The host muted all participants', 'info');
          }
          break;
        }

        case 'PEER_MEDIA_UPDATE': {
          if (data.peerId && data.peerId !== myId) {
            setRemotePeers((prev) => {
              if (!prev[data.peerId]) return prev;
              return {
                ...prev,
                [data.peerId]: {
                  ...prev[data.peerId],
                  isVideoEnabled: data.isVideoEnabled,
                  isAudioEnabled: data.isAudioEnabled,
                  isScreenSharing: data.isScreenSharing,
                },
              };
            });

            if (!data.isVideoEnabled && !data.isScreenSharing) {
              setRemoteStreamActive(false);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
              if (remoteImgRef.current) {
                remoteImgRef.current.src = '';
              }
            }
          }
          break;
        }

        case 'VIDEO_FRAME': {
          if (data.frame && !stateRef.current.isInstructor) {
            setRemoteStreamActive(true);
            if (remoteImgRef.current) {
              remoteImgRef.current.src = data.frame;
            }
          }
          break;
        }

        case 'RTC_OFFER': {
          if (!stateRef.current.isInstructor && data.targetId === myId) {
            handleRtcOffer(data);
          }
          break;
        }

        case 'RTC_ANSWER': {
          if (stateRef.current.isInstructor && data.targetId === myId) {
            handleRtcAnswer(data);
          }
          break;
        }

        case 'RTC_ICE': {
          if (data.targetId === myId) {
            handleRtcIce(data);
          }
          break;
        }

        default:
          break;
      }
    };

    channel.onmessage = handlePeerMessage;

    // Heartbeat every 3 seconds
    const heartbeatTimer = setInterval(() => {
      channel.postMessage({
        type: 'PEER_HEARTBEAT',
        peer: {
          id: myId,
          name: stateRef.current.participantName,
          isInstructor: stateRef.current.isInstructor,
          isVideoEnabled: stateRef.current.isVideoEnabled,
          isAudioEnabled: stateRef.current.isAudioEnabled,
          isHandRaised: stateRef.current.isHandRaised,
          isScreenSharing: stateRef.current.isScreenSharing,
        },
      });

      // Prune inactive peers after 12s
      setRemotePeers((prev) => {
        const now = Date.now();
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([id, p]) => {
          if (now - (p.lastSeen || 0) < 12000) {
            next[id] = p;
          } else {
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 3000);

    return () => {
      clearInterval(heartbeatTimer);
      channel.postMessage({
        type: 'PEER_LEAVE',
        id: myId,
        name: stateRef.current.participantName,
      });
      channel.close();
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
    };
  }, [sessionId, myId, showToast, startPeerConnection, startFrameBroadcast, handleRtcOffer, handleRtcAnswer, handleRtcIce]);

  // Connect to LiveKit Room if credentials exist
  useEffect(() => {
    let activeRoom = null;
    let isCancelled = false;

    const connectToRoom = async () => {
      try {
        const lkRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        activeRoom = lkRoom;

        lkRoom.on(RoomEvent.Connected, () => {
          if (isCancelled) return;
          setIsLiveKitConnected(true);
          setRoom(lkRoom);
        });

        lkRoom.on(RoomEvent.Disconnected, () => {
          if (isCancelled) return;
          setIsLiveKitConnected(false);
        });

        lkRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video) {
            const el = track.attach();
            el.className = 'w-full h-full object-cover rounded-2xl';
            el.dataset.participant = participant.identity;
            remoteVideoContainerRef.current?.appendChild(el);
            setRemoteStreamActive(true);
          }
        });

        lkRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach().forEach((el) => el.remove());
        });

        await lkRoom.connect(serverUrl, token);

        if (isInstructor) {
          try {
            const videoTrack = await createLocalVideoTrack({ facingMode: 'user' });
            await lkRoom.localParticipant.publishTrack(videoTrack);
            if (localVideoRef.current) {
              videoTrack.attach(localVideoRef.current);
            }
          } catch (e) {
            console.warn('LiveKit video track error:', e.message);
          }

          try {
            const audioTrack = await createLocalAudioTrack();
            await lkRoom.localParticipant.publishTrack(audioTrack);
          } catch (e) {
            console.warn('LiveKit audio track error:', e.message);
          }
        }
      } catch {
        if (!isCancelled) {
          setIsLiveKitConnected(false);

          if (isInstructor) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: true,
              });
              if (!isCancelled) {
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = stream;
                  localVideoRef.current.play().catch(() => {});
                }
                setIsVideoEnabled(true);
                setIsAudioEnabled(true);

                Object.keys(stateRef.current.remotePeers).forEach((peerId) => {
                  startPeerConnection(peerId, stream);
                });
                startFrameBroadcast();
              }
            } catch (mediaErr) {
              console.warn('Local media fallback camera/mic not available:', mediaErr.message);
              if (!isCancelled) {
                setIsVideoEnabled(false);
                setIsAudioEnabled(false);
              }
            }
          }
        }
      }
    };

    connectToRoom();

    return () => {
      isCancelled = true;
      if (activeRoom) {
        activeRoom.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      stopFrameBroadcast();
    };
  }, [serverUrl, token, isInstructor, startPeerConnection, startFrameBroadcast, stopFrameBroadcast]);

  // Audio Toggle
  const handleToggleAudio = useCallback(async () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);

    channelRef.current?.postMessage({
      type: 'PEER_MEDIA_UPDATE',
      peerId: myId,
      isVideoEnabled,
      isAudioEnabled: nextState,
      isScreenSharing,
    });

    if (room?.localParticipant) {
      try {
        await room.localParticipant.setMicrophoneEnabled(nextState);
        showToast(nextState ? 'Microphone unmuted' : 'Microphone muted', nextState ? 'success' : 'info');
        return;
      } catch (err) {
        console.warn('LiveKit mic toggle error:', err);
      }
    }

    if (nextState) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStreamRef.current) {
          stream.getAudioTracks().forEach((track) => localStreamRef.current.addTrack(track));
        } else {
          localStreamRef.current = stream;
        }
        showToast('Microphone unmuted', 'success');
      } catch (err) {
        console.error('Microphone access failed:', err);
        setIsAudioEnabled(false);
        showToast('Microphone unavailable or permission denied', 'error');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => track.stop());
      }
      showToast('Microphone muted', 'info');
    }
  }, [isAudioEnabled, isVideoEnabled, isScreenSharing, myId, room, showToast]);

  // Video Toggle
  const handleToggleVideo = useCallback(async () => {
    const nextState = !isVideoEnabled;
    setIsVideoEnabled(nextState);

    channelRef.current?.postMessage({
      type: 'PEER_MEDIA_UPDATE',
      peerId: myId,
      isVideoEnabled: nextState,
      isAudioEnabled,
      isScreenSharing,
    });

    if (room?.localParticipant) {
      try {
        await room.localParticipant.setCameraEnabled(nextState);
        showToast(nextState ? 'Camera turned on' : 'Camera turned off', nextState ? 'success' : 'info');
        return;
      } catch (err) {
        console.warn('LiveKit camera toggle error:', err);
      }
    }

    if (nextState) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current && !isScreenSharing) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        Object.keys(remotePeers).forEach((peerId) => {
          startPeerConnection(peerId, stream);
        });
        startFrameBroadcast();

        showToast('Camera turned on', 'success');
      } catch (err) {
        console.error('Camera access failed:', err);
        setIsVideoEnabled(false);
        showToast('Camera unavailable or permission denied', 'error');
      }
    } else {
      stopFrameBroadcast();
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => track.stop());
      }
      if (localVideoRef.current && !isScreenSharing) {
        localVideoRef.current.srcObject = null;
      }
      showToast('Camera turned off', 'info');
    }
  }, [
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    myId,
    remotePeers,
    room,
    showToast,
    startFrameBroadcast,
    startPeerConnection,
    stopFrameBroadcast,
  ]);

  // Screen Share Stop Helper
  const handleStopScreenShare = useCallback(async () => {
    setIsScreenSharing(false);

    channelRef.current?.postMessage({
      type: 'PEER_MEDIA_UPDATE',
      peerId: myId,
      isVideoEnabled,
      isAudioEnabled,
      isScreenSharing: false,
    });

    if (room?.localParticipant) {
      try {
        await room.localParticipant.setScreenShareEnabled(false);
      } catch (e) {
        console.warn('LiveKit stop screen share error', e);
      }
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    if (isVideoEnabled && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
      Object.keys(remotePeers).forEach((peerId) => {
        startPeerConnection(peerId, localStreamRef.current);
      });
      startFrameBroadcast();
    } else {
      stopFrameBroadcast();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
    showToast('Screen sharing stopped', 'info');
  }, [room, isVideoEnabled, isAudioEnabled, myId, showToast, remotePeers, startPeerConnection, startFrameBroadcast, stopFrameBroadcast]);

  // Screen Share Toggle
  const handleToggleScreenShare = async () => {
    const nextState = !isScreenSharing;

    if (nextState) {
      if (room?.localParticipant) {
        try {
          await room.localParticipant.setScreenShareEnabled(true);
          setIsScreenSharing(true);
          showToast('Screen sharing started', 'success');
          return;
        } catch (err) {
          console.warn('LiveKit screen share error:', err);
        }
      }

      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });
        screenStreamRef.current = displayStream;
        setIsScreenSharing(true);

        channelRef.current?.postMessage({
          type: 'PEER_MEDIA_UPDATE',
          peerId: myId,
          isVideoEnabled,
          isAudioEnabled,
          isScreenSharing: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
          localVideoRef.current.play().catch(() => {});
        }

        Object.keys(remotePeers).forEach((peerId) => {
          startPeerConnection(peerId, displayStream);
        });
        startFrameBroadcast();

        showToast('Screen sharing started', 'success');

        const screenTrack = displayStream.getVideoTracks()[0];
        if (screenTrack) {
          screenTrack.onended = () => {
            handleStopScreenShare();
          };
        }
      } catch (err) {
        console.warn('Screen share cancelled or not allowed:', err);
        setIsScreenSharing(false);
        if (err.name !== 'NotAllowedError') {
          showToast('Screen share failed: ' + (err.message || 'Cancelled'), 'error');
        }
      }
    } else {
      await handleStopScreenShare();
    }
  };

  // Hand Raise Toggle
  const handleToggleHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    channelRef.current?.postMessage({
      type: 'HAND_RAISE',
      senderId: myId,
      sender: participantName,
      raised: nextState,
    });

    if (room?.localParticipant) {
      try {
        const payload = JSON.stringify({
          type: 'HAND_RAISE',
          sender: participantName,
          raised: nextState,
        });
        room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
      } catch (e) {
        console.warn('LiveKit publishData error:', e);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'You',
        text: nextState ? '✋ You raised your hand.' : 'Hand lowered.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
    ]);

    showToast(nextState ? '✋ Hand raised' : 'Hand lowered', nextState ? 'warning' : 'info');
  };

  // Chat message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    const newMsg = {
      id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 6),
      sender: participantName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);

    channelRef.current?.postMessage({
      type: 'CHAT',
      message: newMsg,
    });

    if (room?.localParticipant) {
      try {
        const packet = JSON.stringify({
          type: 'CHAT',
          sender: participantName,
          text,
        });
        room.localParticipant.publishData(new TextEncoder().encode(packet), { reliable: true });
      } catch (err) {
        console.warn('Failed to publish LiveKit chat message', err);
      }
    }

    setChatInput('');
  };

  // Global Keyboard Shortcuts (F for Fullscreen, M for Mic, V for Video, C for Chat, P for Participants)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleAudio();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (isInstructor) handleToggleVideo();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setActiveSidebar((prev) => (prev === 'chat' ? null : 'chat'));
        setUnreadChatCount(0);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveSidebar((prev) => (prev === 'participants' ? null : 'participants'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFullscreen, isInstructor, handleToggleAudio, handleToggleVideo]);

  // Check if presenter's video is on
  const isPresenterVideoActive = isInstructor
    ? isVideoEnabled || isScreenSharing
    : remotePeers[activePresenter.identity]?.isVideoEnabled || remotePeers[activePresenter.identity]?.isScreenSharing || remoteStreamActive;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden select-none relative">
      {/* Floating Animated Reaction Emojis Canvas Layer */}
      <LiveFloatingReactions reactions={floatingReactions} />

      {/* Top Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/70 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formattedTime}</span>
          </div>

          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-md">{roomName}</h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Secure WebRTC Live Classroom</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5" title={isLiveKitConnected ? 'Connected to LiveKit SFU' : 'Connected via Real-Time Mesh'}>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{isLiveKitConnected ? 'LiveKit Cloud' : 'Connected'}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tenant Authorized</span>
          </div>

          {/* Quick Meeting Info Button */}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Meeting Information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Stage / Video Canvas Area */}
        <main className={`flex-1 min-w-0 relative flex flex-col items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'} bg-slate-950 overflow-hidden`}>
          {/* Action Notification Toast Banner */}
          {toastNotification && (
            <div 
              className={`absolute top-4 right-4 z-40 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md ${
                toastNotification.type === 'error'
                  ? 'bg-rose-950/90 text-rose-200 border-rose-800/80 shadow-rose-950/50'
                  : toastNotification.type === 'warning'
                  ? 'bg-amber-950/90 text-amber-200 border-amber-800/80 shadow-amber-950/50'
                  : toastNotification.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80 shadow-emerald-950/50'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
              }`}
            >
              {toastNotification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {toastNotification.type === 'warning' && <Hand className="w-4 h-4 text-amber-400" />}
              {toastNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toastNotification.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
              <span>{toastNotification.message}</span>
            </div>
          )}

          {/* Floating Stage Banners */}
          {isHandRaised && (
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/90 text-white font-semibold text-xs shadow-lg shadow-amber-500/30 backdrop-blur-md border border-amber-400/40">
              <Hand className="w-4 h-4 animate-bounce" />
              <span>You raised your hand</span>
            </div>
          )}

          {isScreenSharing && (
            <div className="absolute top-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 backdrop-blur-md border border-indigo-400/40">
              <ScreenShare className="w-4 h-4 animate-pulse" />
              <span>Screen Sharing Live</span>
            </div>
          )}

          {/* VIEW MODE 1: Gallery Grid View (Zoom/Meet Style) */}
          {layoutMode === 'grid' ? (
            <LiveGalleryGrid
              participants={participants}
              isInstructor={isInstructor}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              remoteImgRef={remoteImgRef}
              remoteStreamActive={remoteStreamActive}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
              aspectFitMode={aspectFitMode}
              onSelectParticipant={() => setLayoutMode('speaker')}
            />
          ) : (
            /* VIEW MODE 2: Speaker View (Full edge-to-edge cinematic stage) */
            <div className={`w-full h-full relative ${isFullscreen ? 'rounded-none border-0' : 'rounded-2xl border border-slate-800/80'} overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center`}>
              {/* Instructor Local Video / Screen Share Element */}
              {isInstructor && (
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

              {/* Student Remote Video Stream / Frame Feed */}
              {!isInstructor && (
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
                    alt="Host Broadcast"
                    className={`absolute inset-0 w-full h-full z-10 ${
                      aspectFitMode === 'contain' ? 'object-contain' : 'object-cover'
                    } ${remoteStreamActive ? 'block' : 'hidden'}`}
                  />
                </>
              )}

              {/* Container for incoming LiveKit SFU remote tracks */}
              <div ref={remoteVideoContainerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />

              {/* Avatar Placeholder: show when video is off OR when student is waiting for video stream */}
              {(!isPresenterVideoActive || (!isInstructor && !remoteStreamActive)) && (
                <div className="flex flex-col items-center justify-center gap-3 text-center p-8 z-10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 ring-slate-800">
                    {activePresenter.name?.charAt(0)?.toUpperCase() || 'H'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{activePresenter.name}</h3>
                    <p className="text-xs text-slate-400">
                      {isPresenterVideoActive && !remoteStreamActive
                        ? 'Connecting to Host Camera...'
                        : activePresenter.isInstructor
                        ? 'Class Host / Instructor (Camera Off)'
                        : 'Participant Stage'}
                    </p>
                  </div>
                </div>
              )}

              {/* Floating Stage Controls (Top-Right of Video) */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={() => setAspectFitMode((m) => (m === 'cover' ? 'contain' : 'cover'))}
                  title={aspectFitMode === 'cover' ? 'Fit Video to Screen' : 'Fill Stage (Crop)'}
                  className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-md transition-colors cursor-pointer"
                >
                  {aspectFitMode === 'cover' ? <Crop className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-md transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

              {/* Stage bottom badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs text-slate-200 shadow-md z-20">
                <span className="font-semibold">{activePresenter.name}</span>
                {activePresenter.isInstructor && <span className="text-indigo-400 font-bold">• Host</span>}
                {isInstructor && !isAudioEnabled && (
                  <span className="flex items-center text-rose-400 gap-1 ml-1 font-medium">
                    <MicOff className="w-3.5 h-3.5" /> Muted
                  </span>
                )}
                {isInstructor && isHandRaised && (
                  <span className="flex items-center text-amber-400 gap-1 ml-1 font-medium">
                    <Hand className="w-3.5 h-3.5" /> Hand Raised
                  </span>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Chat & Participants */}
        {activeSidebar && (
          <aside 
            className="flex flex-col bg-slate-900 border-l border-slate-800 transition-all duration-200 z-20 shrink-0"
            style={{ width: '360px', minWidth: '320px', maxWidth: '420px', flexShrink: 0, height: '100%' }}
            aria-label="Classroom Sidebar"
          >
            {/* Sidebar Tab Header */}
            <div className="flex items-center border-b border-slate-800 px-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSidebar('chat');
                  setUnreadChatCount(0);
                }}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors ${
                  activeSidebar === 'chat' 
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Class Chat</span>
                {unreadChatCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebar('participants')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors ${
                  activeSidebar === 'participants' 
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Participants ({participants.length || 1})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebar(null)}
                title="Close Sidebar"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat View */}
            {activeSidebar === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs ${
                        msg.isSystem
                          ? 'p-2 rounded-lg bg-slate-800/50 text-slate-400 italic text-center'
                          : 'space-y-1'
                      }`}
                    >
                      {!msg.isSystem && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-indigo-400">{msg.sender}</span>
                          <span className="text-[10px]">{msg.time}</span>
                        </div>
                      )}
                      {!msg.isSystem && (
                        <div className="p-2.5 rounded-lg bg-slate-800/70 text-slate-200 leading-relaxed break-words">
                          {msg.text}
                        </div>
                      )}
                      {msg.isSystem && msg.text}
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question or comment..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Participants View */}
            {activeSidebar === 'participants' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Host Action Bar */}
                {isInstructor && (
                  <div className="p-3 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">Instructor Tools</span>
                    <button
                      type="button"
                      onClick={handleMuteAll}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Mute All</span>
                    </button>
                  </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.identity}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                            {p.isHandRaised && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                                <Hand className="w-3 h-3" /> Hand
                              </span>
                            )}
                          </div>
                          {p.isInstructor && <p className="text-[10px] text-indigo-400 font-bold">Host / Instructor</p>}
                        </div>
                      </div>

                      {p.isLocal && (
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Control Bar */}
      <LiveSessionControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        showChat={activeSidebar === 'chat'}
        showParticipants={activeSidebar === 'participants'}
        isInstructor={isInstructor}
        participantCount={participants.length || 1}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHand={handleToggleHand}
        onToggleChat={() => {
          setActiveSidebar((prev) => (prev === 'chat' ? null : 'chat'));
          setUnreadChatCount(0);
        }}
        onToggleParticipants={() => setActiveSidebar((prev) => (prev === 'participants' ? null : 'participants'))}
        onLeave={onLeave}
        onEndSession={onEndSession}
        canPublish={true}
        canPublishVideo={isInstructor}
        canShareScreen={isInstructor}
        layoutMode={layoutMode}
        onToggleLayout={() => setLayoutMode((m) => (m === 'speaker' ? 'grid' : 'speaker'))}
        aspectFitMode={aspectFitMode}
        onToggleAspectFit={() => setAspectFitMode((m) => (m === 'cover' ? 'contain' : 'cover'))}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onSendReaction={handleSendReaction}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onTogglePiP={handleTogglePiP}
        unreadCount={unreadChatCount}
      />

      {/* Meeting Info Modal */}
      <LiveMeetingInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        roomName={roomName}
        participantCount={participants.length || 1}
        hostName={activePresenter.name}
        sessionId={sessionId}
      />

      {/* Audio / Video Device Settings Modal */}
      <LiveDeviceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default LiveRoom;
