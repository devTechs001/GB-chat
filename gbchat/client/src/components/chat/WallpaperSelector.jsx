import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Default WhatsApp-style wallpaper pattern
const DEFAULT_WALLPAPER = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dcfce7' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M30 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M70 70c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M30 70c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M70 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3C/g%3E%3C/svg%3E"

// Predefined wallpaper collection with enhanced flavors
const WALLPAPERS = [
  // Original wallpapers
  {
    id: 'default',
    name: 'WhatsApp Default',
    url: DEFAULT_WALLPAPER,
    type: 'pattern',
    preview: 'bg-[#e5e5e5]',
    category: 'classic'
  },
  {
    id: 'dots',
    name: 'Polka Dots',
    url: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Ccircle cx='2' cy='2' r='2'/%3E%3Ccircle cx='12' cy='2' r='2'/%3E%3Ccircle cx='2' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-gray-200',
    category: 'classic'
  },
  {
    id: 'stripes',
    name: 'Diagonal Stripes',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2325D366' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-green-50',
    category: 'classic'
  },
  {
    id: 'waves',
    name: 'Waves',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-cyan-50',
    category: 'classic'
  },
  
  // Gradient wallpapers
  {
    id: 'gradient-blue',
    name: 'Ocean Blue',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dbeafe;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2393c5fd;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-blue-100 to-blue-300',
    category: 'gradient'
  },
  {
    id: 'gradient-purple',
    name: 'Mystic Purple',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f3e8ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23c084fc;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-purple-100 to-purple-300',
    category: 'gradient'
  },
  {
    id: 'gradient-sunset',
    name: 'Tropical Sunset',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fef3c7;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23fdba74;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f97316;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-yellow-100 via-orange-200 to-orange-400',
    category: 'gradient'
  },
  {
    id: 'gradient-forest',
    name: 'Forest Green',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dcfce7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2322c55e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-green-100 to-green-400',
    category: 'gradient'
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora Borealis',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='33%25' style='stop-color:%2334d399;stop-opacity:1' /%3E%3Cstop offset='66%25' style='stop-color:%236ee7b7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600',
    category: 'gradient'
  },
  {
    id: 'gradient-candy',
    name: 'Candy Pink',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fce7f3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ec4899;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-pink-100 to-pink-400',
    category: 'gradient'
  },

  // Dark theme wallpapers
  {
    id: 'dark-dots',
    name: 'Dark Dots',
    url: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231f2937' fill-opacity='0.3'%3E%3Ccircle cx='2' cy='2' r='2'/%3E%3Ccircle cx='12' cy='2' r='2'/%3E%3Ccircle cx='2' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-gray-700',
    category: 'dark'
  },
  {
    id: 'dark-gradient',
    name: 'Midnight Dark',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231f2937;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23111827;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-gray-700 to-gray-900',
    category: 'dark'
  },
  {
    id: 'dark-space',
    name: 'Deep Space',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='grad'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23000000;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/g%3E%3Ccircle cx='20' cy='30' r='1' fill='white' opacity='0.8'/%3E%3Ccircle cx='80' cy='60' r='1.5' fill='white' opacity='0.6'/%3E%3Ccircle cx='50' cy='20' r='0.8' fill='white' opacity='0.9'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-slate-800 to-black',
    category: 'dark'
  },

  // Nature themed wallpapers
  {
    id: 'nature-leaves',
    name: 'Nature Leaves',
    url: "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.15'%3E%3Cpath d='M40 40 L50 30 L60 40 L50 50 Z'/%3E%3Cpath d='M20 20 L30 10 L40 20 L30 30 Z'/%3E%3Cpath d='M60 60 L70 50 L80 60 L70 70 Z'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-green-50',
    category: 'nature'
  },
  {
    id: 'nature-bamboo',
    name: 'Bamboo Forest',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='0.2'%3E%3Crect x='8' y='0' width='2' height='40'/%3E%3Crect x='18' y='5' width='2' height='35'/%3E%3Crect x='28' y='0' width='2' height='40'/%3E%3Crect x='38' y='8' width='2' height='32'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-emerald-50',
    category: 'nature'
  },
  {
    id: 'nature-cherry',
    name: 'Cherry Blossoms',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fce7f3' fill-opacity='0.3'%3E%3Ccircle cx='15' cy='15' r='8'/%3E%3Ccircle cx='45' cy='45' r='6'/%3E%3Ccircle cx='30' cy='35' r='10'/%3E%3C/g%3E%3Cg stroke='%23ec4899' stroke-width='1' fill='none'%3E%3Cpath d='M15 15 L12 10 M15 15 L18 10 M45 45 L42 40 M45 45 L48 40'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-pink-50',
    category: 'nature'
  },
  {
    id: 'nature-autumn',
    name: 'Autumn Leaves',
    url: "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f97316' fill-opacity='0.2'%3E%3Cpath d='M25 25 L30 15 L35 25 L30 35 Z'/%3E%3Cpath d='M10 40 L15 30 L20 40 L15 50 Z'/%3E%3C/g%3E%3Cg fill='%23dc2626' fill-opacity='0.15'%3E%3Cpath d='M40 10 L45 5 L50 10 L45 20 Z'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-orange-50',
    category: 'nature'
  },

  // Geometric patterns
  {
    id: 'geo-hexagon',
    name: 'Hexagon Pattern',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M30 5 L50 17.5 L50 42.5 L30 55 L10 42.5 L10 17.5 Z'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-indigo-50',
    category: 'geometric'
  },
  {
    id: 'geo-triangle',
    name: 'Triangle Mesh',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ef4444' fill-opacity='0.1'%3E%3Cpath d='M0 40 L20 0 L40 40 Z'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-red-50',
    category: 'geometric'
  },
  {
    id: 'geo-circles',
    name: 'Circle Grid',
    url: "data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23a855f7' stroke-width='1' opacity='0.3'%3E%3Ccircle cx='15' cy='15' r='10'/%3E%3Ccircle cx='5' cy='5' r='3'/%3E%3Ccircle cx='25' cy='25' r='3'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-purple-50',
    category: 'geometric'
  },
  {
    id: 'geo-plaid',
    name: 'Plaid Pattern',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Crect x='0' y='0' width='20' height='20' fill='%233b82f6' opacity='0.3'/%3E%3Crect x='20' y='20' width='20' height='20' fill='%233b82f6' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-blue-50',
    category: 'geometric'
  },

  // Textured wallpapers
  {
    id: 'texture-linen',
    name: 'Linen Texture',
    url: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.5'%3E%3Crect x='0' y='0' width='1' height='20'/%3E%3Crect x='5' y='0' width='1' height='20'/%3E%3Crect x='10' y='0' width='1' height='20'/%3E%3Crect x='15' y='0' width='1' height='20'/%3E%3C/g%3E%3C/svg%3E",
    type: 'texture',
    preview: 'bg-slate-100',
    category: 'texture'
  },
  {
    id: 'texture-concrete',
    name: 'Concrete',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' fill='%23d4d4d8' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E",
    type: 'texture',
    preview: 'bg-gray-100',
    category: 'texture'
  },
  {
    id: 'texture-marble',
    name: 'Marble',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='marble'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.02' numOctaves='2' result='turbulence'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' fill='%23f8fafc' filter='url(%23marble)'/%3E%3C/svg%3E",
    type: 'texture',
    preview: 'bg-slate-50',
    category: 'texture'
  },

  // Abstract wallpapers
  {
    id: 'abstract-fluid',
    name: 'Fluid Art',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='fluid'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' result='turbulence'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='2'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' fill='%23dbeafe' filter='url(%23fluid)' opacity='0.3'/%3E%3C/svg%3E",
    type: 'abstract',
    preview: 'bg-blue-100',
    category: 'abstract'
  },
  {
    id: 'abstract-bubbles',
    name: 'Bubble Party',
    url: "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.2'%3E%3Ccircle cx='20' cy='20' r='15'/%3E%3Ccircle cx='60' cy='60' r='10'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3Ccircle cx='10' cy='50' r='12'/%3E%3Ccircle cx='70' cy='30' r='6'/%3E%3C/g%3E%3C/svg%3E",
    type: 'abstract',
    preview: 'bg-yellow-50',
    category: 'abstract'
  },
  {
    id: 'abstract-lightning',
    name: 'Lightning',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e293b;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23667ee8;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3Cg stroke='%23fbbf24' stroke-width='2' fill='none' opacity='0.6'%3E%3Cpath d='M20 30 L25 50 L30 35'/%3E%3Cpath d='M70 20 L75 40 L80 25'/%3E%3Cpath d='M50 60 L55 80 L60 65'/%3E%3C/g%3E%3C/svg%3E",
    type: 'abstract',
    preview: 'bg-gradient-to-br from-gray-800 to-blue-600',
    category: 'abstract'
  },

  // Seasonal themes
  {
    id: 'season-winter',
    name: 'Winter Snow',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.8'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='30' cy='25' r='1.5'/%3E%3Ccircle cx='50' cy='15' r='1'/%3E%3Ccircle cx='20' cy='40' r='2.5'/%3E%3Ccircle cx='45' cy='50' r='1.8'/%3E%3C/g%3E%3C/svg%3E",
    type: 'seasonal',
    preview: 'bg-blue-50',
    category: 'seasonal'
  },
  {
    id: 'season-spring',
    name: 'Spring Flowers',
    url: "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a7f3d0' fill-opacity='0.3'%3E%3Ccircle cx='10' cy='10' r='5'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='25' cy='25' r='6'/%3E%3C/g%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='25' cy='25' r='2.5'/%3E%3C/g%3E%3C/svg%3E",
    type: 'seasonal',
    preview: 'bg-yellow-50',
    category: 'seasonal'
  },

  // Minimalist designs
  {
    id: 'minimal-lines',
    name: 'Minimal Lines',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23d1d5db' stroke-width='0.5' fill='none'%3E%3Cline x1='0' y1='20' x2='40' y2='20'/%3E%3Cline x1='20' y1='0' x2='20' y2='40'/%3E%3C/g%3E%3C/svg%3E",
    type: 'minimal',
    preview: 'bg-gray-50',
    category: 'minimal'
  },
  {
    id: 'minimal-dots',
    name: 'Subtle Dots',
    url: "data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.3'%3E%3Ccircle cx='5' cy='5' r='1'/%3E%3Ccircle cx='25' cy='25' r='1'/%3E%3Ccircle cx='5' cy='25' r='1'/%3E%3Ccircle cx='25' cy='5' r='1'/%3E%3C/g%3E%3C/svg%3E",
    type: 'minimal',
    preview: 'bg-white',
    category: 'minimal'
  },
]

const WallpaperSelector = ({ isOpen, onClose, onSelect, currentWallpaper }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'classic', label: 'Classic' },
    { id: 'gradient', label: 'Gradients' },
    { id: 'dark', label: 'Dark' },
    { id: 'nature', label: 'Nature' },
    { id: 'geometric', label: 'Geometric' },
    { id: 'texture', label: 'Textures' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'minimal', label: 'Minimal' },
  ]

  const filteredWallpapers = selectedCategory === 'all' 
    ? WALLPAPERS 
    : WALLPAPERS.filter(w => w.category === selectedCategory)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        {/* Handle for mobile */}
        <div className="md:hidden flex items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Choose Wallpaper</h2>
              <p className="text-xs text-white/80">Customize your chat background</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallpaper Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredWallpapers.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => {
                  onSelect(wallpaper.url)
                  onClose()
                }}
                className={clsx(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg',
                  currentWallpaper === wallpaper.url
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                )}
              >
                {/* Preview */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${wallpaper.url}')`,
                    backgroundSize: wallpaper.type === 'pattern' ? 'auto' : 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                {/* Check mark for selected */}
                {currentWallpaper === wallpaper.url && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1 shadow-lg">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{wallpaper.name}</p>
                </div>
              </button>
            ))}

            {/* Custom URL option */}
            <CustomWallpaperOption onSelect={onSelect} onClose={onClose} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 md:rounded-b-2xl">
          <button
            onClick={() => {
              onSelect(null)
              onClose()
            }}
            className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Custom URL input option
const CustomWallpaperOption = ({ onSelect, onClose }) => {
  const [showInput, setShowInput] = React.useState(false)
  const [url, setUrl] = React.useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onSelect(url.trim())
      setUrl('')
      setShowInput(false)
      onClose()
    }
  }

  if (showInput) {
    return (
      <div className="col-span-2 md:col-span-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-primary-500">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Wallpaper URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/wallpaper.jpg"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false)
                setUrl('')
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
    >
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Custom URL</span>
    </button>
  )
}

export default WallpaperSelector
export { WALLPAPERS, DEFAULT_WALLPAPER }
