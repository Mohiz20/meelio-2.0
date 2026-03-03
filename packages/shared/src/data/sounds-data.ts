import { Sound, SoundType } from "../types";
import { SoundIcons } from "../components/icons";
import { env } from "../utils/env.utils";
import { isChromeExtension } from "../utils/common.utils";

const SOUND_FILES_EXTENSION = ".mp3";

const getSoundPath = (folder: string, filename: string) => {
  const base = env.cdnUrl || '';
  // For extensions, sounds are in public/sounds/ directory
  // For web app, sounds are in /sounds/ directory (served from public folder)
  const effectiveBase = base || (isChromeExtension() ? 'public/sounds' : 'sounds');
  const separator = effectiveBase && !effectiveBase.endsWith('/') ? '/' : '';
  return `${effectiveBase}${separator}${folder}/${filename}${SOUND_FILES_EXTENSION}`;
};

export const allSounds: Sound[] = [
  {
    id: SoundType.RainOnTent,
    playing: false,
    volume: 0.5,
    name: "Rain Tent",
    url: getSoundPath('rain-tent', 'rain-tent'),
    icon: SoundIcons.rainOnTent,
  },
  {
    id: SoundType.Waves,
    playing: false,
    volume: 0.5,
    name: "Waves",
    url: getSoundPath('waves', 'waves'),
    icon: SoundIcons.waves,
  },
  {
    id: SoundType.TropicalForest,
    playing: false,
    volume: 0.5,
    name: "Tropical Forest",
    url: getSoundPath('tropical-forest', 'tropical-forest'),
    icon: SoundIcons.tropicalForest,
  },
  {
    id: SoundType.Campfire,
    playing: false,
    volume: 0.5,
    name: "Campfire",
    url: getSoundPath('fireplace', 'fireplace'),
    icon: SoundIcons.campfire,
  },
  {
    id: SoundType.ThunderStorm,
    playing: false,
    volume: 0.5,
    name: "Thunder Storm",
    url: getSoundPath('thunderstorm', 'thunderstorm'),
    icon: SoundIcons.thunderstorm,
  },
  {
    id: SoundType.Train,
    playing: false,
    volume: 0.5,
    name: "Train",
    url: getSoundPath('train', 'train'),
    icon: SoundIcons.train,
  },
  {
    id: SoundType.CoffeeShop,
    playing: false,
    volume: 0.5,
    name: "Coffee Shop",
    url: getSoundPath('coffeeshop', 'coffeeshop'),
    icon: SoundIcons.coffee,
  },
  {
    id: SoundType.Underwater,
    playing: false,
    volume: 0.5,
    name: "Underwater",
    url: getSoundPath('underwater', 'underwater'),
    icon: SoundIcons.underwater,
  },
  {
    id: SoundType.WhiteNoise,
    playing: false,
    volume: 0.5,
    name: "White Noise",
    url: getSoundPath('white-noise', 'white-noise'),
    icon: SoundIcons.whiteNoise,
  },
  {
    id: SoundType.PinkNoise,
    playing: false,
    volume: 0.5,
    name: "Pink Noise",
    url: getSoundPath('pink-noise', 'pink-noise'),
    icon: SoundIcons.pinkNoise,
  },
  {
    id: SoundType.BrownNoise,
    playing: false,
    volume: 0.5,
    name: "Brown Noise",
    url: getSoundPath('brown-noise', 'brown-noise'),
    icon: SoundIcons.brownNoise,
  },
  {
    id: SoundType.Cicadas,
    playing: false,
    volume: 0.5,
    name: "Cicadas",
    url: getSoundPath('cicada', 'cicada'),
    icon: SoundIcons.cicadas,
  },
  {
    id: SoundType.SpaceEngine,
    playing: false,
    volume: 0.5,
    name: "Space Engine",
    url: getSoundPath('space-engine', 'space-engine'),
    icon: SoundIcons.spaceEngine,
  },
  {
    id: SoundType.Wind,
    playing: false,
    volume: 0.5,
    name: "Wind",
    url: getSoundPath('wind', 'wind'),
    icon: SoundIcons.wind,
  },
  {
    id: SoundType.WindHowling,
    playing: false,
    volume: 0.5,
    name: "Howling Wind",
    url: getSoundPath('wind-howling', 'wind-howling'),
    icon: SoundIcons.windHowling,
  },
  {
    id: SoundType.Cityscape,
    playing: false,
    volume: 0.5,
    name: "Cityscape",
    url: getSoundPath('city-scape', 'city-scape'),
    icon: SoundIcons.cityScape,
  },
  {
    id: SoundType.Water,
    playing: false,
    volume: 0.5,
    name: "Water",
    url: getSoundPath('river-stream', 'river-stream'),
    icon: SoundIcons.water,
  },
  {
    id: SoundType.SummerNight,
    playing: false,
    volume: 0.5,
    name: "Summer Night",
    url: getSoundPath('summer-nights', 'summer-nights'),
    icon: SoundIcons.summerNight,
  },
  {
    id: SoundType.Fan,
    playing: false,
    volume: 0.5,
    name: "Fan",
    url: getSoundPath('fan', 'fan'),
    icon: SoundIcons.fan,
  },
  {
    id: SoundType.Leaves,
    playing: false,
    volume: 0.5,
    name: "Leaves",
    url: getSoundPath('leaves', 'leaves'),
    icon: SoundIcons.autumn,
  },
  {
    id: SoundType.Airplane,
    playing: false,
    volume: 0.5,
    name: "Airplane",
    url: getSoundPath('airplane', 'airplane'),
    icon: SoundIcons.airplane,
  },
  {
    id: SoundType.Bubbles,
    playing: false,
    volume: 0.5,
    name: "Bubbles",
    url: getSoundPath('bubbles', 'bubbles'),
    icon: SoundIcons.bubbles,
  },
  {
    id: SoundType.Waterfall,
    playing: false,
    volume: 0.5,
    name: "Waterfall",
    url: getSoundPath('waterfall', 'waterfall'),
    icon: SoundIcons.waterfall,
  },
  {
    id: SoundType.Whale,
    playing: false,
    volume: 0.5,
    name: "Whale",
    url: getSoundPath('whale', 'whale'),
    icon: SoundIcons.whale,
  },
  {
    id: SoundType.Fire,
    playing: false,
    volume: 0.5,
    name: "Bonfire",
    url: getSoundPath('fire', 'fire'),
    icon: SoundIcons.fire,
  },
  {
    id: SoundType.WashingMachine,
    playing: false,
    volume: 0.5,
    name: "Washing Machine",
    url: getSoundPath('washing-machine', 'washing-machine'),
    icon: SoundIcons.washingMachine,
  },
  {
    id: SoundType.Rain,
    playing: false,
    volume: 0.5,
    name: "Rain",
    url: getSoundPath('rain-low', 'rain-low'),
    icon: SoundIcons.rain,
  },
  {
    id: SoundType.RainOnUmbrella,
    playing: false,
    volume: 0.5,
    name: "Rain On Umbrella",
    url: getSoundPath('rain-on-umbrella', 'rain-on-umbrella'),
    icon: SoundIcons.rainOnUmbrella,
  },
  {
    id: SoundType.CosmicSounds,
    playing: false,
    volume: 0.5,
    name: "Cosmic Sounds",
    url: getSoundPath('cosmos', 'cosmos'),
    icon: SoundIcons.cosmos,
  },
  {
    id: SoundType.Forest,
    playing: false,
    volume: 0.5,
    name: "Forest",
    url: getSoundPath('forest', 'forest'),
    icon: SoundIcons.forest,
  },
  {
    id: SoundType.OceanWaves,
    playing: false,
    volume: 0.5,
    name: "Ocean Waves",
    url: getSoundPath('ocean-waves', 'ocean-waves'),
    icon: SoundIcons.oceanWaves,
  },
  {
    id: SoundType.WaterStream,
    playing: false,
    volume: 0.5,
    name: "Water Stream",
    url: getSoundPath('water-stream', 'water-stream'),
    icon: SoundIcons.waterStream,
  },
];

export const keyboardSounds = {
  space: getSoundPath('keyboard', 'space'),
  return: getSoundPath('keyboard', 'return'),
  backspace: getSoundPath('keyboard', 'backspace'),
  keys: [
    getSoundPath('keyboard', 'key-01'),
    getSoundPath('keyboard', 'key-02'),
    getSoundPath('keyboard', 'key-03'),
    getSoundPath('keyboard', 'key-04'),
    getSoundPath('keyboard', 'key-05'),
  ],
};

export const breathingSounds = {
  inhaleExhale: getSoundPath('breathing', 'inhale-exhale'),
  hold: getSoundPath('breathing', 'hold'),
};

export const pomodoroSounds: {
  id: string;
  name: string;
  url: string;
}[] = [
  {
    id: "timeout-1-back-chime",
    name: "Back Chime",
    url: getSoundPath('pomodoro', 'timeout-1-back-chime'),
  },
  {
    id: "timeout-2-bell-chime",
    name: "Bell Chime",
    url: getSoundPath('pomodoro', 'timeout-2-bell-chime'),
  },
  {
    id: "timeout-3-forward-single-chime",
    name: "Forward Single Chime",
    url: getSoundPath('pomodoro', 'timeout-3-forward-single-chime'),
  },
  {
    id: "timeout-4-beep",
    name: "Beep",
    url: getSoundPath('pomodoro', 'timeout-4-beep'),
  },
];
