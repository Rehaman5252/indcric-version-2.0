import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique referral code from userId
 * Format: ref_{first 8 chars of uuid}
 */
export function generateReferralCode(userId: string): string {
  const shortId = userId.substring(0, 8);
  return `ref_${shortId}`;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^ref_[a-z0-9]{8}$/.test(code);
}
