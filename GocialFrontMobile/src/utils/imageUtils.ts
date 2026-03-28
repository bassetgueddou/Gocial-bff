import { Platform } from 'react-native';
import { Image as ImageCompressor } from 'react-native-compressor';

/**
 * Compresse une image si elle dépasse la taille maximale.
 * - Si ≤ maxSizeKb → retourne l'URI originale (pas de perte de qualité)
 * - Si > maxSizeKb → compresse automatiquement
 * - Si toujours > maxSizeKb après compression → throw une erreur
 */
export async function compressImageIfNeeded(
  uri: string,
  fileSize?: number,
  maxSizeKb: number = 300,
): Promise<string> {
  const maxBytes = maxSizeKb * 1024;

  // Déjà sous la limite → retourner tel quel
  if (fileSize !== undefined && fileSize <= maxBytes) {
    return uri;
  }

  // Web : pas de compression native disponible
  if (Platform.OS === 'web') {
    if (fileSize !== undefined && fileSize > maxBytes) {
      throw new Error(`L'image dépasse ${maxSizeKb} Ko. Choisis une image plus légère.`);
    }
    return uri;
  }

  // Compresser avec react-native-compressor
  const compressed = await ImageCompressor.compress(uri, {
    compressionMethod: 'auto',
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.7,
  });

  // Vérifier la taille après compression
  const response = await fetch(compressed);
  const blob = await response.blob();

  if (blob.size > maxBytes) {
    throw new Error(
      `L'image est trop volumineuse (${Math.round(blob.size / 1024)} Ko après compression). Maximum : ${maxSizeKb} Ko.`,
    );
  }

  return compressed;
}
