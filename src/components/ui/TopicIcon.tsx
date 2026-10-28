import {
  Activity,
  Award,
  CalendarDays,
  Droplet,
  Droplets,
  Feather,
  Flame,
  FlaskConical,
  Gem,
  GraduationCap,
  Grid3x3,
  HandHeart,
  HeartPulse,
  type LucideIcon,
  MapPin,
  MessageCircleHeart,
  PersonStanding,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Spline,
  Stethoscope,
  Sun,
  Syringe,
  Users,
  Waves,
  Zap,
} from 'lucide-react'

/*
  One icon per topic, chosen for what the treatment or idea does (owner, 29 Oct 2026: icons across
  the site). Unknown topics fall back to Sparkles.
*/
const ICONS: Record<string, LucideIcon> = {
  // Treatments
  'hifu-22d-skin-tightening': Waves,
  'non-surgical-face-lifting': Activity,
  'rf-microneedling': Grid3x3,
  'thread-lift': Spline,
  'hydrating-facial': Droplets,
  'chemical-peels': FlaskConical,
  'ai-skin-analysis': ScanFace,
  'carbon-laser-facial': Zap,
  'laser-skin-treatments': Sun,
  botox: Syringe,
  'dermal-fillers': Droplet,
  'liquid-rhinoplasty': Gem,
  'fat-dissolving-injections': Flame,
  // Categories
  'face-lifting-and-tightening': Waves,
  'skin-and-facials': Sparkles,
  'laser-treatments': Zap,
  injectables: Syringe,
  hair: Feather,
  body: PersonStanding,
  'medical-dermatology': Stethoscope,
  // Ideas used across the site
  doctor: Stethoscope,
  technology: ScanFace,
  price: ShieldCheck,
  branches: MapPin,
  consultation: MessageCircleHeart,
  plan: HeartPulse,
  treatment: Sparkles,
  aftercare: HandHeart,
  internship: Award,
  training: GraduationCap,
  seats: Users,
  calendar: CalendarDays,
  safety: ShieldCheck,
}

export function TopicIcon({
  topic,
  size = 24,
  className,
}: {
  topic: string
  size?: number
  className?: string
}) {
  const Icon = ICONS[topic] ?? Sparkles
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" className={className} />
}

/** The icon in a rounded gold-outlined tile; it turns gold when its card is hovered. */
export function IconBadge({ topic, size = 24 }: { topic: string; size?: number }) {
  return (
    <span className="icon-badge">
      <TopicIcon topic={topic} size={size} />
    </span>
  )
}
