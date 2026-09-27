import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LiveSessionControls from '../../../src/features/liveSessions/components/LiveSessionControls';

describe('LiveSessionControls Center and Bottom Buttons', () => {
  it('renders all center bottom buttons for publisher / instructor', () => {
    const onToggleAudio = vi.fn();
    const onToggleVideo = vi.fn();
    const onToggleScreenShare = vi.fn();
    const onToggleHand = vi.fn();
    const onToggleChat = vi.fn();
    const onToggleParticipants = vi.fn();
    const onLeave = vi.fn();
    const onEndSession = vi.fn();

    render(
      <LiveSessionControls
        isAudioEnabled={true}
        isVideoEnabled={true}
        isScreenSharing={false}
        isHandRaised={false}
        showChat={true}
        showParticipants={false}
        isInstructor={true}
        participantCount={3}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onToggleScreenShare={onToggleScreenShare}
        onToggleHand={onToggleHand}
        onToggleChat={onToggleChat}
        onToggleParticipants={onToggleParticipants}
        onLeave={onLeave}
        onEndSession={onEndSession}
        canPublish={true}
        canPublishVideo={true}
        canShareScreen={true}
      />
    );

    // 1. Microphone button
    const micBtn = screen.getByRole('button', { name: /Mute Microphone/i });
    expect(micBtn).toBeInTheDocument();
    fireEvent.click(micBtn);
    expect(onToggleAudio).toHaveBeenCalledTimes(1);

    // 2. Camera button
    const videoBtn = screen.getByRole('button', { name: /Turn Off Camera/i });
    expect(videoBtn).toBeInTheDocument();
    fireEvent.click(videoBtn);
    expect(onToggleVideo).toHaveBeenCalledTimes(1);

    // 3. Screen Share button
    const screenBtn = screen.getByRole('button', { name: /Share Screen/i });
    expect(screenBtn).toBeInTheDocument();
    fireEvent.click(screenBtn);
    expect(onToggleScreenShare).toHaveBeenCalledTimes(1);

    // 4. Hand Raise button
    const handBtn = screen.getByRole('button', { name: /Raise Hand/i });
    expect(handBtn).toBeInTheDocument();
    fireEvent.click(handBtn);
    expect(onToggleHand).toHaveBeenCalledTimes(1);

    // 5. Chat button
    const chatBtn = screen.getByRole('button', { name: /Close Classroom Chat/i });
    expect(chatBtn).toBeInTheDocument();
    fireEvent.click(chatBtn);
    expect(onToggleChat).toHaveBeenCalledTimes(1);

    // 6. Participants button
    const participantsBtn = screen.getByRole('button', { name: /Participants \(3\)/i });
    expect(participantsBtn).toBeInTheDocument();
    fireEvent.click(participantsBtn);
    expect(onToggleParticipants).toHaveBeenCalledTimes(1);

    // 7. End session & Leave buttons
    const endBtn = screen.getByRole('button', { name: /End Class/i });
    expect(endBtn).toBeInTheDocument();
    fireEvent.click(endBtn);
    expect(onEndSession).toHaveBeenCalledTimes(1);

    const leaveBtn = screen.getByRole('button', { name: /Leave/i });
    expect(leaveBtn).toBeInTheDocument();
    fireEvent.click(leaveBtn);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('updates aria-labels and styles when buttons are in toggled states', () => {
    render(
      <LiveSessionControls
        isAudioEnabled={false}
        isVideoEnabled={false}
        isScreenSharing={true}
        isHandRaised={true}
        showChat={false}
        showParticipants={true}
        isInstructor={false}
        participantCount={1}
        onToggleAudio={vi.fn()}
        onToggleVideo={vi.fn()}
        onToggleScreenShare={vi.fn()}
        onToggleHand={vi.fn()}
        onToggleChat={vi.fn()}
        onToggleParticipants={vi.fn()}
        onLeave={vi.fn()}
        canPublish={true}
        canPublishVideo={false}
        canShareScreen={false}
      />
    );

    // Audio muted label
    expect(screen.getByRole('button', { name: /Unmute Microphone/i })).toBeInTheDocument();

    // Hand raised label
    expect(screen.getByRole('button', { name: /Lower Your Hand/i })).toBeInTheDocument();

    // Chat closed label
    expect(screen.getByRole('button', { name: /Open Classroom Chat/i })).toBeInTheDocument();

    // End class button hidden for non-instructor
    expect(screen.queryByRole('button', { name: /End Class/i })).not.toBeInTheDocument();
  });

  it('handles Zoom/Google Meet controls: reactions, fullscreen, layout mode, settings and info', () => {
    const onSendReaction = vi.fn();
    const onToggleFullscreen = vi.fn();
    const onToggleLayout = vi.fn();
    const onToggleAspectFit = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenInfo = vi.fn();

    render(
      <LiveSessionControls
        isAudioEnabled={true}
        isVideoEnabled={true}
        isScreenSharing={false}
        isHandRaised={false}
        showChat={false}
        showParticipants={false}
        isInstructor={false}
        participantCount={2}
        isFullscreen={false}
        layoutMode="speaker"
        aspectFitMode="cover"
        onSendReaction={onSendReaction}
        onToggleFullscreen={onToggleFullscreen}
        onToggleLayout={onToggleLayout}
        onToggleAspectFit={onToggleAspectFit}
        onOpenSettings={onOpenSettings}
        onOpenInfo={onOpenInfo}
        onToggleAudio={vi.fn()}
        onToggleVideo={vi.fn()}
        onToggleScreenShare={vi.fn()}
        onToggleHand={vi.fn()}
        onToggleChat={vi.fn()}
        onToggleParticipants={vi.fn()}
        onLeave={vi.fn()}
        canPublish={false}
      />
    );

    // Fullscreen button
    const fsBtn = screen.getByRole('button', { name: /Enter Fullscreen/i });
    expect(fsBtn).toBeInTheDocument();
    fireEvent.click(fsBtn);
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);

    // Layout switcher button
    const layoutBtn = screen.getByRole('button', { name: /Switch to Gallery View/i });
    expect(layoutBtn).toBeInTheDocument();
    fireEvent.click(layoutBtn);
    expect(onToggleLayout).toHaveBeenCalledTimes(1);

    // Aspect ratio button
    const aspectBtn = screen.getByRole('button', { name: /Toggle Video Aspect Ratio/i });
    expect(aspectBtn).toBeInTheDocument();
    fireEvent.click(aspectBtn);
    expect(onToggleAspectFit).toHaveBeenCalledTimes(1);

    // Settings button
    const settingsBtn = screen.getByRole('button', { name: /Device Settings/i });
    expect(settingsBtn).toBeInTheDocument();
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    // Info button
    const infoBtn = screen.getByRole('button', { name: /Classroom Information/i });
    expect(infoBtn).toBeInTheDocument();
    fireEvent.click(infoBtn);
    expect(onOpenInfo).toHaveBeenCalledTimes(1);

    // Reaction menu button
    const reactionBtn = screen.getByRole('button', { name: /Send Reaction/i });
    expect(reactionBtn).toBeInTheDocument();
    fireEvent.click(reactionBtn);
    // Menu opens with reaction emojis (e.g. 👏, ❤️)
    const clapBtn = screen.getByText('👏');
    expect(clapBtn).toBeInTheDocument();
    fireEvent.click(clapBtn);
    expect(onSendReaction).toHaveBeenCalledWith('👏');
  });
});
