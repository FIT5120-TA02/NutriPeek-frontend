/**
 * StorageKeys.ts
 * Constants for storage keys used throughout the application
 */

import { StorageItem } from '@/libs/StorageService';

export const USER_INFO: StorageItem<{
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | '';
}> = {
  key: 'nutripeek_user_info',
  defaultValue: {}
};
