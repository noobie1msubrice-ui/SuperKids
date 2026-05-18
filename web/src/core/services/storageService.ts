import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './firebase';
import { LIMITS } from '../utils/constants';
import { AppError } from './functionsService';

/** Derives a file extension from a MIME type, defaulting to `png`. */
function extensionFor(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] ?? 'png';
}

export const storageService = {
  /**
   * Uploads a store-item image to `storeItems/{parentId}/{fileId}.{ext}` and
   * returns the download URL plus the storage path (kept so the file can later
   * be deleted). Validates type and size before upload.
   */
  async uploadStoreImage(
    parentId: string,
    fileId: string,
    file: File,
  ): Promise<{ imageUrl: string; imagePath: string }> {
    if (!file.type.startsWith('image/')) {
      throw new AppError('invalid-file', 'Please choose an image file.');
    }
    if (file.size >= LIMITS.imageMaxBytes) {
      throw new AppError('file-too-large', 'That image is too big (max 5 MB).');
    }
    const path = `storeItems/${parentId}/${fileId}.${extensionFor(file.type)}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file, { contentType: file.type });
    const imageUrl = await getDownloadURL(fileRef);
    return { imageUrl, imagePath: path };
  },

  /** Deletes a store-item image. A missing file is treated as success. */
  async deleteStoreImage(imagePath: string): Promise<void> {
    try {
      await deleteObject(ref(storage, imagePath));
    } catch {
      // The image was already gone — nothing to clean up.
    }
  },
};
