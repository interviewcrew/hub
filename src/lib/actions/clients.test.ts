import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient, getClients, getClient, updateClient, deleteClient } from './clients';
import { clients } from '@/db/schema';
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
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';

vi.mock('next/cache');

describe('Client Server Actions', () => {
  const accountManagerId = generateMockUuid(1);
  const clientId = generateMockUuid(2);

  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  describe('createClient', () => {
    it('should create a client successfully if account manager exists', async () => {
      const mockClientData = { name: 'Test Client', accountManagerId };
      const mockReturnedClient = { id: clientId, ...mockClientData, contactInfo: null, createdAt: new Date(), updatedAt: new Date() };

      mockSelectWithWhereChain([{ id: accountManagerId }]);
      const { returning, values } = mockInsertChain([mockReturnedClient]);

      const result = await createClient(mockClientData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedClient);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalledWith(clients);
      expect(values).toHaveBeenCalledWith(mockClientData);
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/clients');
    });

    it('should return error if account manager does not exist', async () => {
      const mockClientData = { name: 'Test Client', accountManagerId };

      mockSelectWithWhereChain([]);

      const result = await createClient(mockClientData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account manager not found');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should return error for invalid data', async () => {
      const invalidData = { name: '' }; // Missing accountManagerId
      const result = await createClient(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('accountManagerId');
    });

    it('should handle database errors during creation', async () => {
        const mockClientData = { name: 'Test Client', accountManagerId };
        mockSelectWithWhereChain([{ id: accountManagerId }]);
        mockInsertError(new Error('DB insert error'));

        const result = await createClient(mockClientData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('DB insert error');
    });
  });

  describe('getClients', () => {
    it('should fetch all clients successfully', async () => {
        const mockData = [{ id: clientId, name: 'Client 1', accountManagerId }];
        const { from, orderBy } = mockSelectChain(mockData);

        const result = await getClients();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(from).toHaveBeenCalledWith(clients);
        expect(orderBy).toHaveBeenCalled();
    });

    it('should fetch clients by accountManagerId successfully', async () => {
        const mockData = [{ id: clientId, name: 'Client 1', accountManagerId }];
        const { from, where, orderBy } = mockSelectChain(mockData);

        const result = await getClients(accountManagerId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);

        expect(from).toHaveBeenCalledWith(clients);
        expect(where).toHaveBeenCalled();
        expect(orderBy).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
        mockSelectError(new Error('DB fetch error'));
        const result = await getClients();
        expect(result.success).toBe(false);
        expect(result.error).toBe('DB fetch error');
    });
  });

  describe('getClient', () => {
    it('should fetch a single client successfully', async () => {
      const mockData = { id: clientId, name: 'Client 1', accountManagerId };
      const { where } = mockSelectWithWhereChain([mockData]);

      const result = await getClient(clientId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);

      expect(where).toHaveBeenCalled();
    });

    it('should return error when client not found', async () => {
      mockSelectWithWhereChain([]);
      const result = await getClient('not-found-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Client not found');
    });

    it('should handle database errors', async () => {
        mockSelectWithWhereError(new Error('DB fetch error'));
        const result = await getClient(clientId);
        expect(result.success).toBe(false);
        expect(result.error).toBe('DB fetch error');
    });
  });

  describe('updateClient', () => {
    it('should update a client successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const mockReturnedData = { id: clientId, name: 'Updated Name', accountManagerId };
      const { set, where, returning } = mockUpdateChain([mockReturnedData]);

      const result = await updateClient(clientId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedData);

      expect(mockDb.update).toHaveBeenCalledWith(clients);
      expect(set).toHaveBeenCalledWith(updateData);
      expect(where).toHaveBeenCalled();
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/clients');
      expect(revalidatePath).toHaveBeenCalledWith(`/clients/${clientId}`);
    });

    it('should return error for invalid data', async () => {
        const invalidData = { name: 123 }; // name should be a string
        const result = await updateClient(clientId, invalidData);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Expected string, received number');
    });

    it('should return error when client to update is not found', async () => {
      mockUpdateChain([]);
      const result = await updateClient('not-found-id', { name: 'New Name' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Client not found');
    });

    it('should handle database errors', async () => {
        mockUpdateError(new Error('DB update error'));
        const result = await updateClient(clientId, { name: 'New Name' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('DB update error');
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      const mockReturnedData = { id: clientId, name: 'Client 1' };
      const { where, returning } = mockDeleteChain([mockReturnedData]);

      const result = await deleteClient(clientId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturnedData);

      expect(mockDb.delete).toHaveBeenCalledWith(clients);
      expect(where).toHaveBeenCalled();
      expect(returning).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/clients');
    });

    it('should return error when client to delete is not found', async () => {
        mockDeleteChain([]);
        const result = await deleteClient('not-found-id');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Client not found');
    });

    it('should handle database errors', async () => {
        mockDeleteError(new Error('DB delete error'));
        const result = await deleteClient(clientId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('DB delete error');
    });
  });
}); 