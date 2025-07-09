'use server';

import { db } from '@/lib/db';
import { accountManagers } from '@/db/schema';
import {
  createAccountManagerSchema,
  updateAccountManagerSchema,
} from '@/lib/validators/accountManager';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createAccountManager(
  input: z.infer<typeof createAccountManagerSchema>,
) {
  try {
    const validatedData = createAccountManagerSchema.parse(input);
    
    const [accountManager] = await db
      .insert(accountManagers)
      .values(validatedData)
      .returning();
    
    revalidatePath('/account-managers');
    return { success: true, data: accountManager };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create account manager' };
  }
}

export async function getAccountManagers() {
  try {
    const accountManagersList = await db.select().from(accountManagers);
    return { success: true, data: accountManagersList };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch account managers' };
  }
}

export async function getAccountManager(id: string) {
  try {
    const [accountManager] = await db
      .select()
      .from(accountManagers)
      .where(eq(accountManagers.id, id));
    
    if (!accountManager) {
      return { success: false, error: 'Account manager not found' };
    }
    
    return { success: true, data: accountManager };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch account manager' };
  }
}

export async function updateAccountManager(
  id: string,
  input: z.infer<typeof updateAccountManagerSchema>,
) {
  try {
    const validatedData = updateAccountManagerSchema.parse(input);
    
    const [accountManager] = await db
      .update(accountManagers)
      .set(validatedData)
      .where(eq(accountManagers.id, id))
      .returning();
    
    if (!accountManager) {
      return { success: false, error: 'Account manager not found' };
    }
    
    revalidatePath('/account-managers');
    return { success: true, data: accountManager };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update account manager' };
  }
}

export async function deleteAccountManager(id: string) {
  try {
    const [accountManager] = await db
      .delete(accountManagers)
      .where(eq(accountManagers.id, id))
      .returning();
    
    if (!accountManager) {
      return { success: false, error: 'Account manager not found' };
    }
    
    revalidatePath('/account-managers');
    return { success: true, data: accountManager };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete account manager' };
  }
} 