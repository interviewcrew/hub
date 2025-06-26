import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAccountManager, getAccountManagers, getAccountManager, updateAccountManager, deleteAccountManager } from './accountManagers';
import { accountManagers } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { 
  mockDb, 
  resetDbMocks, 
  mockInsertChain, 
  mockSelectChain, 
  mockSelectWithWhereChain, 
  mockUpdateChain, 
  mockDeleteChain,
  mockInsertError,
  mockSelectError,
  mockSelectWithWhereError,
  mockUpdateError,
  mockDeleteError
} from '@/tests/utils/drizzleMocks';

describe('AccountManager Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  describe('createAccountManager', () => {
    it('should create an account manager successfully', async () => {
      const mockData = { name: 'John Doe', email: 'john@example.com' };
      const mockReturnedData = { id: '1', ...mockData, createdAt: new Date(), updatedAt: new Date() };
      
      const { returning, values } = mockInsertChain([mockReturnedData]);

      const result = await createAccountManager(mockData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedData);

      expect(mockDb.insert).toHaveBeenCalledWith(accountManagers);
      expect(values).toHaveBeenCalledWith(mockData);
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/account-managers');
    });

    it('should return error for invalid data', async () => {
      const invalidData = { name: '', email: 'invalid-email' };

      const result = await createAccountManager(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Name is required');
    });

    it('should handle database errors', async () => {
      const mockData = { name: 'John Doe', email: 'john@example.com' };

      mockInsertError(new Error('Database error'));

      const result = await createAccountManager(mockData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAccountManagers', () => {
    it('should fetch all account managers successfully', async () => {
      const mockData = [
        { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      const { from } = mockSelectChain(mockData);

      const result = await getAccountManagers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);

      expect(mockDb.select).toHaveBeenCalled();
      expect(from).toHaveBeenCalledWith(accountManagers);
    });

    it('should handle database errors', async () => {
      mockSelectError(new Error('Database error'));

      const result = await getAccountManagers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAccountManager', () => {
    it('should fetch a single account manager successfully', async () => {
      const mockData = { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };
      
      const { where } = mockSelectWithWhereChain([mockData]);

      const result = await getAccountManager('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);

      expect(where).toHaveBeenCalled();
    });

    it('should return error when account manager not found', async () => {
      mockSelectWithWhereChain([]);

      const result = await getAccountManager('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account manager not found');
    });

    it('should handle database errors', async () => {
      mockSelectWithWhereError(new Error('Database error'));

      const result = await getAccountManager('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateAccountManager', () => {
    it('should update an account manager successfully', async () => {
      const mockData = { name: 'John Updated' };
      const mockReturnedData = { id: '1', name: 'John Updated', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };
      
      const { set, where, returning } = mockUpdateChain([mockReturnedData]);

      const result = await updateAccountManager('1', mockData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedData);

      expect(mockDb.update).toHaveBeenCalledWith(accountManagers);
      expect(set).toHaveBeenCalledWith(mockData);
      expect(where).toHaveBeenCalled();
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/account-managers');
    });

    it('should return error for invalid data', async () => {
      const invalidData = { email: 'invalid-email' };

      const result = await updateAccountManager('1', invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email address');
    });

    it('should return error when account manager not found', async () => {
      const mockData = { name: 'John Updated' };
      
      mockUpdateChain([]);

      const result = await updateAccountManager('999', mockData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account manager not found');
    });

    it('should handle database errors', async () => {
      const mockData = { name: 'John Updated' };
      
      mockUpdateError(new Error('Database error'));

      const result = await updateAccountManager('1', mockData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('deleteAccountManager', () => {
    it('should delete an account manager successfully', async () => {
      const mockReturnedData = { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() };
      
      const { where, returning } = mockDeleteChain([mockReturnedData]);

      const result = await deleteAccountManager('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedData);

      expect(mockDb.delete).toHaveBeenCalledWith(accountManagers);
      expect(where).toHaveBeenCalled();
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/account-managers');
    });

    it('should return error when account manager not found', async () => {
      mockDeleteChain([]);

      const result = await deleteAccountManager('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account manager not found');
    });

    it('should handle database errors', async () => {
      mockDeleteError(new Error('Database error'));

      const result = await deleteAccountManager('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
}); 