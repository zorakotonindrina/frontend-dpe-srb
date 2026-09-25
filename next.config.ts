import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Activer React strict mode pour détecter les problèmes potentiels
  reactStrictMode: true,

  // Export statique (Firebase Hosting gratuit — pas de serveur Next.js).
  // Pas de serveur = pas d'optimisation d'image ni de headers() dynamiques ;
  // les en-têtes de sécurité sont repris dans firebase.json.
  output: 'export',

  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
