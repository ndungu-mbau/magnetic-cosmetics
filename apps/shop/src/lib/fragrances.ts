import bottleFloral from "@/assets/bottle-floral.jpg";
import bottleOriental from "@/assets/bottle-oriental.jpg";
import bottleFresh from "@/assets/bottle-fresh.jpg";
import bottleWoody from "@/assets/bottle-woody.jpg";

export type Family = "Floral" | "Oriental" | "Fresh" | "Woody";
export type Gender = "Feminine" | "Masculine" | "Unisex";

export type Fragrance = {
  slug: string;
  name: string;
  tagline: string;
  family: Family;
  gender: Gender;
  image: string;
  priceUsd: number;
  sizes: number[]; // ml
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  description: string;
};

export const fragrances: Fragrance[] = [
  {
    slug: "velours-rose",
    name: "Velours Rose",
    tagline: "A velvet rose, undressed by candlelight.",
    family: "Floral",
    gender: "Feminine",
    image: bottleFloral,
    priceUsd: 148,
    sizes: [30, 50, 100],
    topNotes: ["Pink pepper", "Lychee"],
    heartNotes: ["Damask rose", "Iris", "Peony"],
    baseNotes: ["White musk", "Sandalwood"],
    description:
      "An opulent damask rose laid over a bed of iris and white musk. Composed to feel like silk against bare skin.",
  },
  {
    slug: "lune-lavande",
    name: "Lune Lavande",
    tagline: "Lavender fields at the edge of midnight.",
    family: "Oriental",
    gender: "Unisex",
    image: bottleOriental,
    priceUsd: 162,
    sizes: [50, 100],
    topNotes: ["Bergamot", "Lavender"],
    heartNotes: ["Violet", "Tonka bean"],
    baseNotes: ["Amber", "Bourbon vanilla", "Benzoin"],
    description:
      "Provençal lavender warmed by tonka and bourbon vanilla. A nightcap of a fragrance — slow, golden, hypnotic.",
  },
  {
    slug: "soir-de-mai",
    name: "Soir de Mai",
    tagline: "A pale evening, just before it rains.",
    family: "Fresh",
    gender: "Feminine",
    image: bottleFresh,
    priceUsd: 138,
    sizes: [30, 50],
    topNotes: ["Pear", "Mandarin"],
    heartNotes: ["Peony", "White tea"],
    baseNotes: ["Cedarwood", "Soft musk"],
    description:
      "Crisp pear and mandarin tumble into peony and white tea. A blush of a fragrance for the in-between hours.",
  },
  {
    slug: "iris-noir",
    name: "Iris Noir",
    tagline: "Smoke, suede, and a single iris.",
    family: "Woody",
    gender: "Masculine",
    image: bottleWoody,
    priceUsd: 178,
    sizes: [50, 100],
    topNotes: ["Black pepper", "Cardamom"],
    heartNotes: ["Iris", "Violet leaf"],
    baseNotes: ["Oud", "Smoked suede", "Patchouli"],
    description:
      "An iris dressed in oud and smoked suede. Quietly devastating — for those who arrive late and leave first.",
  },
  {
    slug: "fleur-de-sel",
    name: "Fleur de Sel",
    tagline: "Salt on the mouth, jasmine on the wrist.",
    family: "Floral",
    gender: "Unisex",
    image: bottleFresh,
    priceUsd: 154,
    sizes: [50, 100],
    topNotes: ["Sea salt", "Bergamot"],
    heartNotes: ["Jasmine sambac", "Neroli"],
    baseNotes: ["Driftwood", "Ambergris"],
    description:
      "A salted breeze threaded with jasmine sambac. Composed in late summer with the windows open.",
  },
  {
    slug: "cuir-blush",
    name: "Cuir Blush",
    tagline: "Pink leather, kept in a velvet drawer.",
    family: "Woody",
    gender: "Feminine",
    image: bottleFloral,
    priceUsd: 184,
    sizes: [50, 100],
    topNotes: ["Saffron", "Pink pepper"],
    heartNotes: ["Rose absolute", "Suede"],
    baseNotes: ["Leather", "Labdanum", "Vanilla"],
    description:
      "Saffron and rose absolute bloom over soft Italian leather. Sensual, never loud.",
  },
  {
    slug: "ambre-violet",
    name: "Ambre Violet",
    tagline: "Amber the color of a bruised plum.",
    family: "Oriental",
    gender: "Feminine",
    image: bottleOriental,
    priceUsd: 168,
    sizes: [30, 50, 100],
    topNotes: ["Plum", "Cassis"],
    heartNotes: ["Violet", "Heliotrope"],
    baseNotes: ["Amber", "Cocoa absolute", "Musk"],
    description:
      "Plum and cassis poured into violet and amber. A romantic, slightly gourmand reverie.",
  },
  {
    slug: "verre-clair",
    name: "Verre Clair",
    tagline: "Sunlight through a windowpane in May.",
    family: "Fresh",
    gender: "Unisex",
    image: bottleFresh,
    priceUsd: 132,
    sizes: [50, 100],
    topNotes: ["Italian lemon", "Petitgrain"],
    heartNotes: ["Orange blossom", "Green tea"],
    baseNotes: ["White cedar", "Clean musk"],
    description:
      "A clean, luminous citrus laced with orange blossom and green tea. The most uncomplicated kind of joy.",
  },
];

export function getFragrance(slug: string) {
  return fragrances.find((f) => f.slug === slug);
}
