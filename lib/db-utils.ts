import mongoose from 'mongoose';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Common database error handler
 * Formats Mongoose validation and duplicate key errors into readable messages
 */
export function handleDbError(error: any): string {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return errors.join(', ');
  }
  
  // Duplicate key error (e.g., unique email or referral code)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return `An account with that ${field} already exists.`;
  }

  return error.message || 'An unexpected database error occurred.';
}
