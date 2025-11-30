// Dictionnaire des longueurs d'IBAN par pays européen
const IBAN_LENGTHS: Record<string, number> = {
  FR: 27, // France
  DE: 22, // Allemagne
  ES: 24, // Espagne
  IT: 27, // Italie
  BE: 16, // Belgique
  NL: 18, // Pays-Bas
  PT: 25, // Portugal
  CH: 21, // Suisse
  LU: 20, // Luxembourg
  GB: 22, // Royaume-Uni
  AT: 20, // Autriche
  IE: 22, // Irlande
  MC: 27, // Monaco
  AD: 24, // Andorre
};

// Noms de pays pour l'affichage
const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  DE: 'Allemagne',
  ES: 'Espagne',
  IT: 'Italie',
  BE: 'Belgique',
  NL: 'Pays-Bas',
  PT: 'Portugal',
  CH: 'Suisse',
  LU: 'Luxembourg',
  GB: 'Royaume-Uni',
  AT: 'Autriche',
  IE: 'Irlande',
  MC: 'Monaco',
  AD: 'Andorre',
};

/**
 * Nettoie l'IBAN en supprimant les espaces, tirets et en convertissant en majuscules
 */
export const cleanIban = (iban: string): string => {
  return iban.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * Formate l'IBAN avec des espaces tous les 4 caractères pour la lisibilité
 */
export const formatIban = (iban: string): string => {
  const clean = cleanIban(iban);
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

/**
 * Vérifie la clé de contrôle IBAN selon l'algorithme Modulo 97
 * Cette vérification est universelle pour tous les IBAN
 */
export const isValidIbanChecksum = (iban: string): boolean => {
  const clean = cleanIban(iban);
  
  // Déplacer les 4 premiers caractères à la fin
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  
  // Convertir les lettres en chiffres (A=10, B=11, ..., Z=35)
  const numericString = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // A-Z
      return (code - 55).toString();
    }
    return char;
  }).join('');
  
  // Calculer mod 97 par morceaux pour éviter les problèmes de précision avec de grands nombres
  let remainder = numericString;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
  }
  
  return parseInt(remainder, 10) % 97 === 1;
};

/**
 * Valide un IBAN européen complet (format, longueur, clé de contrôle)
 */
export const validateEuropeanIban = (iban: string): {
  isValid: boolean;
  error?: string;
  countryCode?: string;
} => {
  if (!iban || iban.trim() === '') {
    return { isValid: true }; // Champ optionnel
  }
  
  const clean = cleanIban(iban);
  
  // Vérifier le format de base (2 lettres + 2 chiffres + reste alphanumérique)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(clean)) {
    return {
      isValid: false,
      error: "Format IBAN invalide. L'IBAN doit commencer par un code pays (2 lettres) suivi de 2 chiffres",
    };
  }
  
  const countryCode = clean.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[countryCode];
  
  // Vérifier si le pays est supporté
  if (!expectedLength) {
    return {
      isValid: false,
      error: `Le code pays "${countryCode}" n'est pas reconnu. Pays supportés : FR, DE, ES, IT, BE, NL, PT, CH, LU, GB, AT, IE, MC, AD`,
    };
  }
  
  // Vérifier la longueur spécifique au pays
  if (clean.length !== expectedLength) {
    return {
      isValid: false,
      error: `L'IBAN ${countryCode} doit contenir ${expectedLength} caractères (actuellement ${clean.length})`,
    };
  }
  
  // Vérifier la clé de contrôle mod 97
  if (!isValidIbanChecksum(clean)) {
    return {
      isValid: false,
      error: "Clé de contrôle IBAN invalide. Veuillez vérifier les caractères saisis",
    };
  }
  
  return {
    isValid: true,
    countryCode,
  };
};

/**
 * Obtient le nom du pays à partir du code ISO
 */
export const getCountryName = (countryCode: string): string => {
  return COUNTRY_NAMES[countryCode] || countryCode;
};

/**
 * Nettoie le BIC en supprimant les espaces et en convertissant en majuscules
 */
export const cleanBic = (bic: string): string => {
  return bic.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * Valide un code BIC/SWIFT
 */
export const validateBic = (bic: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!bic || bic.trim() === '') {
    return { isValid: true }; // Champ optionnel
  }
  
  const clean = cleanBic(bic);
  
  // Vérifier la longueur (8 ou 11 caractères)
  if (clean.length !== 8 && clean.length !== 11) {
    return {
      isValid: false,
      error: `Le BIC doit contenir 8 ou 11 caractères (actuellement ${clean.length})`,
    };
  }
  
  // Vérifier le format: 4 lettres + 2 lettres + 2 alphanum + (3 alphanum optionnels)
  // Format: AAAABBCCXXX où A=banque, B=pays, C=location, X=branche (optionnel)
  const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  
  if (!bicRegex.test(clean)) {
    return {
      isValid: false,
      error: "Format BIC invalide. Structure attendue : 4 lettres (banque) + 2 lettres (pays) + 2 caractères (location) + 3 caractères optionnels (branche)",
    };
  }
  
  // Vérifier que le code pays correspond à un code ISO valide
  const countryCode = clean.slice(4, 6);
  const validCountryCodes = Object.keys(IBAN_LENGTHS);
  
  if (!validCountryCodes.includes(countryCode)) {
    return {
      isValid: false,
      error: `Le code pays "${countryCode}" dans le BIC n'est pas reconnu`,
    };
  }
  
  return { isValid: true };
};
