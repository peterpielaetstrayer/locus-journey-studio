/**
 * First Landing environmental media registry.
 *
 * Development placeholders use local SVG assets. Final licensed photography
 * should replace these at the same paths with .webp files.
 */

export type FocalPosition = {
  /** Horizontal focal point 0–100 (object-position X) */
  x: number;
  /** Vertical focal point 0–100 (object-position Y) */
  y: number;
};

export type EnvironmentalMedia = {
  id: string;
  /** Current dev asset path (SVG placeholder) */
  src: string;
  /** Intended production asset */
  productionSrc: string;
  alt: string;
  focal: FocalPosition;
  /** CSS gradient fallback when image unavailable */
  fallbackGradient: string;
  location?: string;
  time?: string;
};

export const FIRST_LANDING_MEDIA = {
  entrance: {
    id: "entrance",
    src: "/images/first-landing/entrance.svg",
    productionSrc: "/images/first-landing/entrance.png",
    alt: "First Landing State Park wetland at dawn — still water, cypress trunks, mist over the boardwalk edge",
    focal: { x: 48, y: 42 },
    fallbackGradient:
      "linear-gradient(180deg, hsl(203 35% 12%) 0%, hsl(157 25% 18%) 50%, hsl(207 36% 8%) 100%)",
    location: "First Landing",
    time: "7:18 AM",
  },
  routeAwakening: {
    id: "route-awakening",
    src: "/images/first-landing/route-awakening.svg",
    productionSrc: "/images/first-landing/route-awakening.webp",
    alt: "Wetland trail emerging from morning fog — hand-drawn route beginning visible through mist",
    focal: { x: 45, y: 55 },
    fallbackGradient:
      "linear-gradient(160deg, hsl(203 35% 14%) 0%, hsl(193 30% 22%) 60%, hsl(157 20% 16%) 100%)",
    location: "First Landing",
    time: "7:22 AM",
  },
  waterFingerprint: {
    id: "water-fingerprint",
    src: "/images/first-landing/water-fingerprint.svg",
    productionSrc: "/images/first-landing/water-fingerprint.webp",
    alt: "Dark saturated soil and exposed roots near boardwalk — evidence of water influence without visible water",
    focal: { x: 55, y: 65 },
    fallbackGradient:
      "linear-gradient(180deg, hsl(157 25% 16%) 0%, hsl(203 30% 14%) 100%)",
    location: "Boardwalk overlook",
    time: "7:31 AM",
  },
  cypressKnees: {
    id: "cypress-knees",
    src: "/images/first-landing/cypress-knees.svg",
    productionSrc: "/images/first-landing/cypress-knees.webp",
    alt: "Cypress knees rising from standing water at the grove edge — root structures at the water line",
    focal: { x: 50, y: 50 },
    fallbackGradient:
      "linear-gradient(200deg, hsl(157 28% 14%) 0%, hsl(193 35% 20%) 100%)",
    location: "Cypress grove",
    time: "7:38 AM",
  },
  hiddenFlow: {
    id: "hidden-flow",
    src: "/images/first-landing/hidden-flow.svg",
    productionSrc: "/images/first-landing/hidden-flow.webp",
    alt: "Still wetland overlook — calm water surface with subtle reflections and distant cypress",
    focal: { x: 50, y: 35 },
    fallbackGradient:
      "linear-gradient(180deg, hsl(193 40% 28%) 0%, hsl(203 35% 16%) 70%, hsl(157 20% 14%) 100%)",
    location: "Quiet overlook",
    time: "8:04 AM",
  },
  systemsOverlook: {
    id: "systems-overlook",
    src: "/images/first-landing/systems-overlook.svg",
    productionSrc: "/images/first-landing/systems-overlook.webp",
    alt: "Elevated view of wetland system — boardwalk, plant zones, and water channels visible together",
    focal: { x: 50, y: 45 },
    fallbackGradient:
      "linear-gradient(160deg, hsl(203 35% 18%) 0%, hsl(157 25% 22%) 100%)",
    location: "Systems overlook",
    time: "8:22 AM",
  },
  shorelineTransfer: {
    id: "shoreline-transfer",
    src: "/images/first-landing/shoreline-transfer.svg",
    productionSrc: "/images/first-landing/shoreline-transfer.webp",
    alt: "Virginia Beach shoreline where freshwater meets tidal influence — transfer landscape",
    focal: { x: 50, y: 60 },
    fallbackGradient:
      "linear-gradient(180deg, hsl(193 45% 40%) 0%, hsl(39 30% 70%) 60%, hsl(157 20% 30%) 100%)",
    location: "Virginia Beach shoreline",
    time: "Resurfacing",
  },
} as const satisfies Record<string, EnvironmentalMedia>;

export type FirstLandingMediaKey = keyof typeof FIRST_LANDING_MEDIA;

export function getMedia(key: FirstLandingMediaKey): EnvironmentalMedia {
  return FIRST_LANDING_MEDIA[key];
}

export function focalToObjectPosition(focal: FocalPosition): string {
  return `${focal.x}% ${focal.y}%`;
}
