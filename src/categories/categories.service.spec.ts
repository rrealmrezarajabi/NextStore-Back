import { ConflictException, NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

describe("CategoriesService", () => {
  const makePrisma = () => ({
    category: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  });

  it("throws a conflict when deleting a category that has products", async () => {
    const prisma = makePrisma();
    prisma.category.findUnique.mockResolvedValue({
      id: 2,
      name: "Electronics",
    });
    prisma.product.count.mockResolvedValue(1);

    const service = new CategoriesService(prisma as never);

    await expect(service.remove(2)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });

  it("deletes a category without products", async () => {
    const prisma = makePrisma();
    prisma.category.findUnique.mockResolvedValue({
      id: 2,
      name: "Electronics",
    });
    prisma.product.count.mockResolvedValue(0);
    prisma.category.delete.mockResolvedValue({
      id: 2,
      name: "Electronics",
    });

    const service = new CategoriesService(prisma as never);

    await expect(service.remove(2)).resolves.toEqual({ id: 2, deleted: true });
    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });

  it("keeps returning not found for missing categories", async () => {
    const prisma = makePrisma();
    prisma.category.findUnique.mockResolvedValue(null);

    const service = new CategoriesService(prisma as never);

    await expect(service.remove(2)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.product.count).not.toHaveBeenCalled();
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });
});
