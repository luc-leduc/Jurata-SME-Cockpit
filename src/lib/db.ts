import { mockDb } from './db/mock';

// Wrap database calls in try-catch
export async function executeQuery<T>(
  query: string,
  args?: any[]
): Promise<{ rows: T[] }> {
  try {
    return await mockDb.query(query, args);
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database operation failed');
  }
}