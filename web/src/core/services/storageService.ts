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

  /**
   * Uploads the photo a kid attaches when marking a task done. Fixed path
   * `taskEvidence/{taskId}/evidence` means each new submission overwrites the
   * previous one (handy if the parent rejects and the kid retries with a
   * different photo). Returns both the download URL and the storage path so
   * the latter can be persisted on the task doc for later cleanup.
   */
  async uploadTaskEvidence(
    taskId: string,
    file: File,
  ): Promise<{ evidenceUrl: string; evidencePath: string }> {
    if (!file.type.startsWith('image/')) {
      throw new AppError('invalid-file', 'Please choose an image file.');
    }
    if (file.size >= LIMITS.imageMaxBytes) {
      throw new AppError('file-too-large', 'That image is too big (max 5 MB).');
    }
    const path = `taskEvidence/${taskId}/evidence.${extensionFor(file.type)}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(fileRef);
    return { evidenceUrl: url, evidencePath: path };
  },

  /**
   * Uploads a profile picture to `avatars/{uid}/avatar` and returns its
   * download URL. The fixed path means each upload overwrites the previous
   * one — no orphan files — and the fresh download token busts any cache.
   */
  async uploadAvatar(uid: string, file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new AppError('invalid-file', 'Please choose an image file.');
    }
    if (file.size >= LIMITS.imageMaxBytes) {
      throw new AppError('file-too-large', 'That image is too big (max 5 MB).');
    }
    const fileRef = ref(storage, `avatars/${uid}/avatar`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return getDownloadURL(fileRef);
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
