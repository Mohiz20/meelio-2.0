import { Category, CategoryType } from "../types";
import { SoundType } from "../types";

export const allCategories: CategoryType[] = [
  {
    id: 1,
    name: Category.Productivity,
    title: "Focus & Productivity",
    description: "Coffee shop ambiance with rain - optimal 70dB for deep work.",
  },
  {
    id: 2,
    name: Category.Relax,
    title: "Relaxation",
    description: "Ocean waves and campfire for stress relief.",
  },
  {
    id: 3,
    name: Category.NoiseBlocker,
    title: "Noise Blocker",
    description: "Layered noise colors to mask distractions.",
  },
  {
    id: 7,
    name: Category.CreativeThinking,
    title: "Creative Flow",
    description: "Nature sounds to inspire creative thinking.",
  },
  {
    id: 9,
    name: Category.BeautifulAmbients,
    title: "Mindfulness",
    description: "Gentle flowing water and forest for meditation.",
  },
  {
    id: 10,
    name: Category.Random,
    title: "Random Mix",
    description: "Discover new soundscapes with a random blend.",
  },
  {
    id: 11,
    name: Category.Motivation,
    title: "Motivation",
    description: "Epic cosmic sounds for energy and drive.",
  },
  {
    id: 12,
    name: Category.Sleep,
    title: "Sleep",
    description: "Brown and pink noise for deeper, more restful sleep.",
  },
  {
    id: 13,
    name: Category.Studying,
    title: "Studying",
    description: "Library-like focus with rain and gentle ambiance.",
  },
  {
    id: 14,
    name: Category.Writing,
    title: "Writing",
    description: "Cozy rain on tent with wind for creative writing.",
  },
];

export const soundCategories: Record<Category, SoundType[]> = {
  // Empty - handled separately with random logic
  Random: [],

  // Coffee shop (70dB ambient) + Rain = research-backed productivity combo
  Productivity: [SoundType.CoffeeShop, SoundType.Rain],

  // Ocean waves + Campfire = classic relaxation, stress reduction
  Relax: [SoundType.OceanWaves, SoundType.Campfire],

  // Layered noise colors for maximum frequency masking
  NoiseBlocker: [SoundType.BrownNoise, SoundType.PinkNoise, SoundType.WhiteNoise],

  // Nature sounds enhance abstract/creative thinking
  CreativeThinking: [SoundType.Forest, SoundType.Rain, SoundType.Wind],

  // Gentle, non-stimulating nature for mindfulness
  BeautifulAmbients: [SoundType.WaterStream, SoundType.Forest],

  // Cosmic + Space engine for epic, motivating feel
  Motivation: [SoundType.CosmicSounds, SoundType.SpaceEngine],

  // Brown + Pink noise - research shows pink noise improves deep sleep
  Sleep: [SoundType.BrownNoise, SoundType.PinkNoise, SoundType.Rain],

  // Cafe focus + rain masking for study sessions
  Studying: [SoundType.CoffeeShop, SoundType.Rain, SoundType.Leaves],

  // Cozy rain on tent + wind = immersive writing environment
  Writing: [SoundType.RainOnTent, SoundType.Wind, SoundType.Campfire],
};
