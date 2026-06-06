import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FC Zürich Affoltern Fb – Anwesenheiten',
    short_name: 'FCZA Anwesenheiten',
    description: 'Trainings- und Turnier-Anwesenheiten tracken',
    start_url: '/',
    display: 'standalone',
    background_color: '#04080e',
    theme_color: '#04080e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
