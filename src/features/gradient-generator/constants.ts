import { GradientConfig, GradientPreset } from './types';

export const DEFAULT_GRADIENT: GradientConfig = {
  type: 'linear',
  angle: 90,
  stops: [
    { id: 'stop-1', color: '#6366F1', position: 0 },
    { id: 'stop-2', color: '#EC4899', position: 100 },
  ],
};

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Ocean Breeze',
    config: {
      type: 'linear',
      angle: 135,
      stops: [
        { id: 'p1-1', color: '#667EEA', position: 0 },
        { id: 'p1-2', color: '#764BA2', position: 100 },
      ],
    },
  },
  {
    name: 'Sunset Glow',
    config: {
      type: 'linear',
      angle: 90,
      stops: [
        { id: 'p2-1', color: '#F093FB', position: 0 },
        { id: 'p2-2', color: '#F5576C', position: 100 },
      ],
    },
  },
  {
    name: 'Fresh Mint',
    config: {
      type: 'linear',
      angle: 120,
      stops: [
        { id: 'p3-1', color: '#43E97B', position: 0 },
        { id: 'p3-2', color: '#38F9D7', position: 100 },
      ],
    },
  },
  {
    name: 'Royal Purple',
    config: {
      type: 'linear',
      angle: 160,
      stops: [
        { id: 'p4-1', color: '#7F00FF', position: 0 },
        { id: 'p4-2', color: '#E100FF', position: 100 },
      ],
    },
  },
  {
    name: 'Warm Flame',
    config: {
      type: 'linear',
      angle: 45,
      stops: [
        { id: 'p5-1', color: '#FF9A9E', position: 0 },
        { id: 'p5-2', color: '#FAD0C4', position: 50 },
        { id: 'p5-3', color: '#FFD1FF', position: 100 },
      ],
    },
  },
  {
    name: 'Cool Blues',
    config: {
      type: 'linear',
      angle: 90,
      stops: [
        { id: 'p6-1', color: '#2193B0', position: 0 },
        { id: 'p6-2', color: '#6DD5ED', position: 100 },
      ],
    },
  },
  {
    name: 'Aurora',
    config: {
      type: 'linear',
      angle: 135,
      stops: [
        { id: 'p7-1', color: '#00C9FF', position: 0 },
        { id: 'p7-2', color: '#92FE9D', position: 100 },
      ],
    },
  },
  {
    name: 'Berry Smoothie',
    config: {
      type: 'linear',
      angle: 90,
      stops: [
        { id: 'p8-1', color: '#E44D26', position: 0 },
        { id: 'p8-2', color: '#F16529', position: 50 },
        { id: 'p8-3', color: '#E44D26', position: 100 },
      ],
    },
  },
  {
    name: 'Northern Lights',
    config: {
      type: 'linear',
      angle: 180,
      stops: [
        { id: 'p9-1', color: '#232526', position: 0 },
        { id: 'p9-2', color: '#414345', position: 50 },
        { id: 'p9-3', color: '#232526', position: 100 },
      ],
    },
  },
  {
    name: 'Peach Sunset',
    config: {
      type: 'linear',
      angle: 90,
      stops: [
        { id: 'p10-1', color: '#FFECD2', position: 0 },
        { id: 'p10-2', color: '#FCB69F', position: 100 },
      ],
    },
  },
  {
    name: 'Cosmic Radial',
    config: {
      type: 'radial',
      angle: 0,
      stops: [
        { id: 'p11-1', color: '#FF6B6B', position: 0 },
        { id: 'p11-2', color: '#556270', position: 100 },
      ],
    },
  },
  {
    name: 'Rainbow Conic',
    config: {
      type: 'conic',
      angle: 0,
      stops: [
        { id: 'p12-1', color: '#FF0000', position: 0 },
        { id: 'p12-2', color: '#FFFF00', position: 25 },
        { id: 'p12-3', color: '#00FF00', position: 50 },
        { id: 'p12-4', color: '#0000FF', position: 75 },
        { id: 'p12-5', color: '#FF0000', position: 100 },
      ],
    },
  },
];

export const MIN_STOPS = 2;
export const MAX_STOPS = 10;
