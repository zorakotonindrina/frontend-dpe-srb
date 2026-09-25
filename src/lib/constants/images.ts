/**
 * Constantes d'images statiques centralisées.
 *
 * Convention :
 *   - Tous les chemins sont relatifs à /public (servis depuis la racine).
 *   - Toujours utiliser ces constantes plutôt que des chaînes littérales
 *     pour garantir la cohérence et faciliter les refactorisations.
 *   - Les images utilisateur (avatars, photos de profil) provenant de
 *     sources dynamiques (auth, base de données) NE sont PAS listées ici.
 *
 * Structure physique :
 *   public/
 *     images/
 *       backgrounds/   ← images de fond (pages auth, etc.)
 *       logos/         ← Marianne RF, logotype AUGURE
 *       icons/         ← icônes décoratives PNG/SVG (≠ Lucide icons)
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Chemin absolu d'une image statique dans /public */
export type StaticImagePath = `/${string}`;

/** Métadonnées complètes pour le composant next/image */
export interface StaticImageMeta {
  src:    StaticImagePath;
  alt:    string;
  width:  number;
  height: number;
}

/* ------------------------------------------------------------------ */
/* Arrière-plans                                                        */
/* ------------------------------------------------------------------ */

export const IMAGE_BACKGROUNDS = {
  /** Arrière-plan de la page de connexion */
  LOGIN:    '/images/backgrounds/login-bg.jpg'    as StaticImagePath,
  /** Arrière-plan de la page d'inscription */
  REGISTER: '/images/backgrounds/register-bg.jpg' as StaticImagePath,
} as const;

/* ------------------------------------------------------------------ */
/* Logos                                                               */
/* ------------------------------------------------------------------ */

export const IMAGE_LOGOS = {
  /** Logo Marianne / République Française (SVG vectoriel) */
  MARIANNE:      '/images/logos/marianne-rf.svg'   as StaticImagePath,
  /** Logotype AUGURE complet (texte + symbole) */
  AUGURE_FULL:   '/images/logos/augureLogo.png'    as StaticImagePath,
  /** Symbole seul AUGURE (sidebar repliée, favicon…) */
  AUGURE_SYMBOL: '/images/logos/logo.png'          as StaticImagePath,
} as const;

/* ------------------------------------------------------------------ */
/* Icônes statiques                                                    */
/* ------------------------------------------------------------------ */

/**
 * Icônes d'images (PNG/SVG décoratifs).
 * À ne pas confondre avec les icônes Lucide utilisées dans les composants UI.
 */
export const IMAGE_ICONS = {
  /** Favicon AUGURE */
  FAVICON:              '/images/icons/favicon.png'              as StaticImagePath,
  /** Placeholder générique pour document manquant */
  DOCUMENT_PLACEHOLDER: '/images/icons/document-placeholder.svg' as StaticImagePath,
  /** Placeholder pour utilisateur sans photo de profil */
  AVATAR_PLACEHOLDER:   '/images/icons/avatar-placeholder.svg'   as StaticImagePath,
} as const;

/* ------------------------------------------------------------------ */
/* Export groupé (barrel)                                              */
/* ------------------------------------------------------------------ */

export const IMAGE_AVATARS = {
  /** Avatar du module encadré / nomination */
  ENCADRE:     '/images/avatars/avatar-encadre.png'    as StaticImagePath,
  /** Avatar du module non encadré / abrogation */
  NON_ENCADRE: '/images/avatars/avatar-nonencadre.png' as StaticImagePath,
} as const;

export const IMAGES = {
  backgrounds: IMAGE_BACKGROUNDS,
  logos:       IMAGE_LOGOS,
  icons:       IMAGE_ICONS,
  avatars:     IMAGE_AVATARS,
} as const;
