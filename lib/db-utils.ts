/**
 * Validates if an ID is non-empty and well-formed
 */
export function isValidObjectId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0;
}

/**
 * Common database error handler
 * Formats MySQL errors into readable messages
 */
export function handleDbError(error: any): string {
  // Duplicate key error in MySQL
  if (error.code === 'ER_DUP_ENTRY') {
    if (error.message?.includes('email')) {
      return 'An account with that email already exists.';
    }
    if (error.message?.includes('phone')) {
      return 'An account with that phone number already exists.';
    }
    if (error.message?.includes('referralCode')) {
      return 'That referral code is already in use.';
    }
    if (error.message?.includes('loginId')) {
      return 'That login ID already exists.';
    }
    return 'A record with duplicate unique details already exists.';
  }

  return error.message || 'An unexpected database error occurred.';
}
