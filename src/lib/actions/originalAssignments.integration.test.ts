import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { originalAssignments } from '@/db/schema';
import {
  createOriginalAssignment,
  getOriginalAssignments,
  getOriginalAssignment,
  updateOriginalAssignment,
  deleteOriginalAssignment,
} from './originalAssignments';
import { createOriginalAssignmentFixture } from '@/tests/fixtures';

describe('Original Assignment Actions - Integration Tests', () => {
  it('should create and retrieve an original assignment with real database', async ({
    db,
  }) => {
    // ARRANGE & ACT
    const createResult = await createOriginalAssignmentFixture({
      name: 'Build E-commerce Platform',
      googleDocFileId: '1ABC123_test_doc_id_456XYZ',
      driveFolderPath: '/assignments/ecommerce-platform',
    });

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data!.name).toBe('Build E-commerce Platform');
    expect(createResult.data!.googleDocFileId).toBe(
      '1ABC123_test_doc_id_456XYZ',
    );
    expect(createResult.data!.driveFolderPath).toBe(
      '/assignments/ecommerce-platform',
    );

    // VERIFY: Data persisted in database
    const [dbAssignment] = await db
      .select()
      .from(originalAssignments)
      .where(eq(originalAssignments.id, createResult.data!.id));

    expect(dbAssignment).toBeDefined();
    expect(dbAssignment.name).toBe('Build E-commerce Platform');
    expect(dbAssignment.googleDocFileId).toBe('1ABC123_test_doc_id_456XYZ');
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE
    const invalidAssignment = {
      name: '', // Empty name should fail validation
      googleDocFileId: '', // Empty googleDocFileId should fail validation
      driveFolderPath: 'Valid path',
    };

    // ACT
    const result = await createOriginalAssignment(invalidAssignment);

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const errorIssues = JSON.parse(result.error!);
    expect(errorIssues[0].message).toBe('Name is required');
    expect(errorIssues[1].message).toBe('Google Doc File ID is required');
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const assignmentData = {
      name: 'CRUD Test Assignment',
      googleDocFileId: '1CRUD_test_doc_id_789ABC',
      driveFolderPath: '/assignments/crud-test',
    };

    // ACT & ASSERT: CREATE
    const createResult = await createOriginalAssignment(assignmentData);
    expect(createResult.success).toBe(true);
    const assignmentId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getOriginalAssignment(assignmentId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.name).toBe(assignmentData.name);
    expect(getResult.data!.googleDocFileId).toBe(
      assignmentData.googleDocFileId,
    );
    expect(getResult.data!.driveFolderPath).toBe(
      assignmentData.driveFolderPath,
    );

    // ACT & ASSERT: READ (get all)
    const getAllResult = await getOriginalAssignments();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(1);
    expect(getAllResult.data![0].name).toBe(assignmentData.name);

    // ACT & ASSERT: UPDATE
    const updateData = {
      name: 'Updated Assignment Name',
      googleDocFileId: '1UPDATED_doc_id_999ZZZ',
      driveFolderPath: '/assignments/updated-crud-test',
    };
    const updateResult = await updateOriginalAssignment(
      assignmentId,
      updateData,
    );
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.name).toBe(updateData.name);
    expect(updateResult.data!.googleDocFileId).toBe(updateData.googleDocFileId);
    expect(updateResult.data!.driveFolderPath).toBe(updateData.driveFolderPath);

    // VERIFY: Update persisted in database
    const [updatedAssignment] = await db
      .select()
      .from(originalAssignments)
      .where(eq(originalAssignments.id, assignmentId));
    expect(updatedAssignment.name).toBe(updateData.name);
    expect(updatedAssignment.googleDocFileId).toBe(updateData.googleDocFileId);
    expect(updatedAssignment.driveFolderPath).toBe(updateData.driveFolderPath);

    // ACT & ASSERT: DELETE
    const deleteResult = await deleteOriginalAssignment(assignmentId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Assignment no longer exists in database
    const [deletedAssignment] = await db
      .select()
      .from(originalAssignments)
      .where(eq(originalAssignments.id, assignmentId));
    expect(deletedAssignment).toBeUndefined();
  });

  it('should handle multiple assignments with different folder paths', async ({}) => {
    // ARRANGE
    const frontendAssignment = {
      name: 'Frontend Component Library',
      googleDocFileId: '1FRONTEND_doc_id_111AAA',
      driveFolderPath: '/assignments/frontend',
    };

    const backendAssignment = {
      name: 'REST API Development',
      googleDocFileId: '1BACKEND_doc_id_222BBB',
      driveFolderPath: '/assignments/backend',
    };

    const fullstackAssignment = {
      name: 'Full Stack Application',
      googleDocFileId: '1FULLSTACK_doc_id_333CCC',
      driveFolderPath: '/assignments/fullstack',
    };

    // ACT
    const result1 = await createOriginalAssignment(frontendAssignment);
    const result2 = await createOriginalAssignment(backendAssignment);
    const result3 = await createOriginalAssignment(fullstackAssignment);

    // ASSERT
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);

    // VERIFY: All assignments exist with correct folder paths
    const allAssignments = await getOriginalAssignments();
    expect(allAssignments.success).toBe(true);
    expect(allAssignments.data).toHaveLength(3);

    const folderPaths = allAssignments.data!.map((a) => a.driveFolderPath);
    expect(folderPaths).toContain('/assignments/frontend');
    expect(folderPaths).toContain('/assignments/backend');
    expect(folderPaths).toContain('/assignments/fullstack');

    // VERIFY: Each assignment has unique doc IDs
    const docIds = allAssignments.data!.map((a) => a.googleDocFileId);
    const uniqueDocIds = new Set(docIds);
    expect(uniqueDocIds.size).toBe(3);
  });

  it('should handle assignments with optional drive folder paths', async () => {
    // ARRANGE
    const assignmentWithoutPath = {
      name: 'Simple Coding Challenge',
      googleDocFileId: '1SIMPLE_doc_id_444DDD',
      // driveFolderPath omitted (optional)
    };

    // ACT
    const result = await createOriginalAssignment(assignmentWithoutPath);

    // ASSERT
    expect(result.success).toBe(true);
    expect(result.data!.name).toBe(assignmentWithoutPath.name);
    expect(result.data!.googleDocFileId).toBe(
      assignmentWithoutPath.googleDocFileId,
    );
    expect(result.data!.driveFolderPath).toBeNull();

    // ARRANGE
    const assignmentWithPath = {
      name: 'Complex Project',
      googleDocFileId: '1COMPLEX_doc_id_555EEE',
      driveFolderPath: '/assignments/complex-projects',
    };

    // ACT
    const result2 = await createOriginalAssignment(assignmentWithPath);

    // ASSERT
    expect(result2.success).toBe(true);
    expect(result2.data!.driveFolderPath).toBe(
      assignmentWithPath.driveFolderPath,
    );
  });

  it('should enforce unique constraints on name and googleDocFileId', async ({}) => {
    // ARRANGE
    const assignment1 = {
      name: 'Unique Assignment',
      googleDocFileId: '1UNIQUE_doc_id_666FFF',
      driveFolderPath: '/assignments/unique1',
    };

    // ACT
    const result1 = await createOriginalAssignment(assignment1);

    // ASSERT
    expect(result1.success).toBe(true);

    // ARRANGE
    const assignmentWithSameName = {
      name: 'Unique Assignment', // Same name
      googleDocFileId: '1DIFFERENT_doc_id_777GGG',
      driveFolderPath: '/assignments/unique2',
    };

    // ACT
    const result2 = await createOriginalAssignment(assignmentWithSameName);

    // ASSERT
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('violates unique constraint');

    // ARRANGE
    const assignmentWithSameDocId = {
      name: 'Different Assignment Name',
      googleDocFileId: '1UNIQUE_doc_id_666FFF', // Same doc ID
      driveFolderPath: '/assignments/unique3',
    };

    // ACT
    const result3 = await createOriginalAssignment(assignmentWithSameDocId);

    // ASSERT
    expect(result3.success).toBe(false);
    expect(result3.error).toContain('violates unique constraint');
  });

  it('should demonstrate that changes from previous test are not visible', async ({
    db,
  }) => {
    // ARRANGE
    const allAssignments = await db.select().from(originalAssignments);

    // ASSERT
    expect(allAssignments).toHaveLength(0);
  });
});
