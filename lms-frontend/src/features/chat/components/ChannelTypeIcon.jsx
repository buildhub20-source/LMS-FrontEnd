import { BookOpen, Building2, Hash, Megaphone, MessageCircle, Radio, Users } from 'lucide-react';
import { CHANNEL_TYPES } from '../constants/chatConstants';

const ICONS = {
  [CHANNEL_TYPES.ORG]: Building2,
  [CHANNEL_TYPES.COURSE]: BookOpen,
  [CHANNEL_TYPES.DIRECT]: MessageCircle,
  [CHANNEL_TYPES.GROUP]: Users,
  [CHANNEL_TYPES.ANNOUNCEMENT]: Megaphone,
  [CHANNEL_TYPES.LIVE_SESSION]: Radio,
};

/** Monochrome line icon for a channel type; inherits the badge's text colour. */
export default function ChannelTypeIcon({ type, size = 16 }) {
  const Icon = ICONS[type] || Hash;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
