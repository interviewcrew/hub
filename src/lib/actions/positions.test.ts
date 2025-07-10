import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockDb,
  resetDbMocks,
  mockSelectChain,
  mockUpdateChain,
  mockDeleteChain,
  mockInsertChain,
  mockInsertError,
  mockUpdateError,
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { createPosition, getPosition, getPositions, updatePosition, deletePosition } from './positions';
import { revalidatePath } from 'next/cache';
import { positions, positionTechStacks, techStacks } from '@/db/schema';

vi.mock('next/cache');

describe("Position Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  const clientId = generateMockUuid(1);
  const accountManagerId = generateMockUuid(2);
  const positionId = generateMockUuid(3);
  const techStackId = generateMockUuid(4);

  const baseTechStackMock = {
    id: techStackId,
    name: "TypeScript",
  };

  const basePositionMock = {
    id: positionId,
    clientId,
    accountManagerId,
    title: "Software Engineer",
  };

  const positionWithTechStacksMock = {
    ...basePositionMock,
    positionTechStacks: [
      {
        positionId,
        techStackId,
        techStack: baseTechStackMock,
      },
    ],
  };

  describe("createPosition", () => {
    it("should create a position and CREATE a new tech stack when it does not exist", async () => {
      // 1. Mock position creation
      mockInsertChain([basePositionMock]);
      // 2. Mock tech stack lookup (not found)
      mockSelectChain([]);
      // 3. Mock tech stack creation
      mockInsertChain([{ id: baseTechStackMock.id }]);
      // 4. Mock linking table insertion (returns nothing)
      mockInsertChain([]);

      // 5. Mock the final getPosition call to return the full object
      mockDb.query.positions.findFirst.mockResolvedValue(
        positionWithTechStacksMock,
      );

      const result = await createPosition({
        clientId,
        accountManagerId,
        title: "Software Engineer",
        techStacks: [baseTechStackMock.name],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(positionWithTechStacksMock);

      // Verify the correct sequence of db calls
      expect(mockDb.insert).toHaveBeenCalledWith(positions);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalledWith(techStacks);
      expect(mockDb.insert).toHaveBeenCalledWith(positionTechStacks);
      expect(revalidatePath).toHaveBeenCalledWith("/positions");
    });

    it("should create a position and use an EXISTING tech stack", async () => {
      // 1. Mock position creation
      mockInsertChain([basePositionMock]);
      // 2. Mock tech stack lookup (found)
      mockSelectChain([{ id: baseTechStackMock.id }]);
      // 3. Mock linking table insertion
      mockInsertChain([]);

      // 4. Mock the final getPosition call
      mockDb.query.positions.findFirst.mockResolvedValue(
        positionWithTechStacksMock,
      );

      const result = await createPosition({
        clientId,
        accountManagerId,
        title: "Software Engineer",
        techStacks: [baseTechStackMock.name],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(positionWithTechStacksMock);

      // Verify that techStacks was NOT inserted into
      expect(mockDb.insert).toHaveBeenCalledWith(positions);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).not.toHaveBeenCalledWith(techStacks);
      expect(mockDb.insert).toHaveBeenCalledWith(positionTechStacks);
      expect(revalidatePath).toHaveBeenCalledWith("/positions");
    });

    it("should return an error if input validation fails", async () => {
      const result = await createPosition({
        clientId: "",
        accountManagerId,
        title: "Software Engineer",
        techStacks: [],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid client ID");
    });

    it("should return an error if the database call fails", async () => {
      mockInsertError(new Error("DB error"));

      const result = await createPosition({
        clientId,
        accountManagerId,
        title: "Software Engineer",
        techStacks: [baseTechStackMock.name],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });

  describe("getPositions", () => {
    it("should fetch all positions with their tech stacks", async () => {
      mockDb.query.positions.findMany.mockResolvedValue([
        positionWithTechStacksMock,
      ]);

      const result = await getPositions();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([positionWithTechStacksMock]);
      expect(mockDb.query.positions.findMany).toHaveBeenCalled();
    });

    it("should return an error if the database call fails", async () => {
      mockDb.query.positions.findMany.mockRejectedValue(new Error("DB error"));

      const result = await getPositions();
      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });

  describe("getPosition", () => {
    it("should fetch a single position with its tech stacks", async () => {
      mockDb.query.positions.findFirst.mockResolvedValue(
        positionWithTechStacksMock,
      );

      const result = await getPosition(positionId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(positionWithTechStacksMock);
    });

    it("should return an error if the position is not found", async () => {
      mockDb.query.positions.findFirst.mockResolvedValue(null);

      const result = await getPosition("non-existent-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Position not found");
    });

    it("should return an error if the database call fails", async () => {
      mockDb.query.positions.findFirst.mockRejectedValue(new Error("DB error"));

      const result = await getPosition(positionId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });

  describe("updatePosition", () => {
    it("should update a position and create a NEW tech stack", async () => {
      const updateData = { title: "Senior Software Engineer" };
      const updatedMock = { ...positionWithTechStacksMock, ...updateData };

      // 1. Mock transaction steps for update
      mockUpdateChain([]); // Updating the position itself
      mockDeleteChain([]); // Deleting old stacks
      mockSelectChain([]); // Finding new stacks (not found)
      mockInsertChain([baseTechStackMock]); // Creating new stacks
      mockInsertChain([]); // Inserting into linking table

      // 2. Mock the final getPosition call
      mockDb.query.positions.findFirst.mockResolvedValue(updatedMock);

      const result = await updatePosition(positionId, {
        ...updateData,
        techStacks: [baseTechStackMock.name],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedMock);
      expect(mockDb.insert).toHaveBeenCalledWith(techStacks);
      expect(revalidatePath).toHaveBeenCalledWith("/positions");
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it("should update a position and use an EXISTING tech stack", async () => {
      const updateData = { title: "Senior Software Engineer" };
      const updatedMock = { ...positionWithTechStacksMock, ...updateData };

      // 1. Mock transaction steps for update
      mockUpdateChain([]); // Updating the position itself
      mockDeleteChain([]); // Deleting old stacks
      mockSelectChain([baseTechStackMock]); // Finding new stacks (found)
      mockInsertChain([]); // Inserting into linking table

      // 2. Mock the final getPosition call
      mockDb.query.positions.findFirst.mockResolvedValue(updatedMock);

      const result = await updatePosition(positionId, {
        ...updateData,
        techStacks: [baseTechStackMock.name],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedMock);
      expect(mockDb.insert).not.toHaveBeenCalledWith(techStacks);
      expect(revalidatePath).toHaveBeenCalledWith("/positions");
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it("should return an error if input validation fails", async () => {
      const result = await updatePosition(positionId, { title: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Title is required");
    });

    it("should return an error if the database call fails", async () => {
      mockUpdateError(new Error("DB error"));

      const result = await updatePosition(positionId, {
        title: "New Title",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });

  describe("deletePosition", () => {
    it("should delete a position successfully", async () => {
      // 1. Mock the transaction steps
      mockDeleteChain([]); // Deleting from positionTechStacks
      mockDeleteChain([basePositionMock]); // Deleting from positions

      const result = await deletePosition(positionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(basePositionMock);
      expect(revalidatePath).toHaveBeenCalledWith("/positions");
    });

    it("should return an error if the position to delete is not found", async () => {
      mockDeleteChain([]); // for positionTechStacks
      mockDeleteChain([]); // for positions (returns empty array, meaning not found)

      const result = await deletePosition(positionId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Position not found");
    });

    it("should return an error if the database call fails", async () => {
      mockDeleteError(new Error("DB error"));

      const result = await deletePosition(positionId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("DB error");
    });
  });
}); 