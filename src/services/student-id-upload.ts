import * as Crypto from 'expo-crypto';
import { File as ExpoFile } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function uploadStudentIdCard(userId: string, asset: ImagePickerAsset) {
  const contentType = asset.mimeType;
  if (!contentType || !ALLOWED_TYPES.includes(contentType as typeof ALLOWED_TYPES[number])) {
    throw new Error('Tumia picha ya JPG, PNG au WebP ya kitambulisho.');
  }

  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    throw new Error('Picha ya kitambulisho iwe chini ya MB 5.');
  }

  if (Platform.OS === 'web') {
    return `${userId}/demo-id-card.${contentType.split('/')[1].replace('jpeg', 'jpg')}`;
  }

  const extension = contentType.split('/')[1].replace('jpeg', 'jpg');
  const path = `${userId}/${Crypto.randomUUID()}.${extension}`;
  const bucket = supabase.storage.from('student-id-cards');
  const options = { contentType, cacheControl: '3600', upsert: false };

  if (asset.file) {
    const { error } = await bucket.upload(path, asset.file, options);
    if (error) throw new Error(error.message);
    return path;
  }

  const bytes = await new ExpoFile(asset.uri).bytes();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const { error } = await bucket.upload(path, buffer, options);
  if (error) throw new Error(error.message);
  return path;
}