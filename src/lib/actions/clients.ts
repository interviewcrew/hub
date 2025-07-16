'use server';

import { db } from '@/lib/db';
import { clients, accountManagers } from '@/db/schema';
import {
  CreateClientInput,
  createClientSchema,
  UpdateClientInput,
  updateClientSchema,
} from '@/lib/validators/client';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createClient(input: CreateClientInput) {
  try {
    const validatedData = createClientSchema.parse(input);

    // Verify that the accountManagerId exists
    const [accountManager] = await db
      .select({ id: accountManagers.id })
      .from(accountManagers)
      .where(eq(accountManagers.id, validatedData.accountManagerId));

    if (!accountManager) {
      return { success: false, error: 'Account manager not found' };
    }

    const [client] = await db.insert(clients).values(validatedData).returning();

    revalidatePath('/clients');
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create client' };
  }
}

export async function getClients(accountManagerId?: string) {
  try {
    const query = db.select().from(clients).orderBy(asc(clients.name));

    if (accountManagerId) {
      query.where(eq(clients.accountManagerId, accountManagerId));
    }

    const clientsList = await query;
    return { success: true, data: clientsList };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch clients' };
  }
}

export async function getClient(id: string) {
  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    return { success: true, data: client };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch client' };
  }
}

export async function updateClient(id: string, input: UpdateClientInput) {
  try {
    const validatedData = updateClientSchema.parse(input);

    const [client] = await db
      .update(clients)
      .set(validatedData)
      .where(eq(clients.id, id))
      .returning();

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update client' };
  }
}

export async function deleteClient(id: string) {
  try {
    const [client] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    revalidatePath('/clients');
    return { success: true, data: client };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete client' };
  }
}
