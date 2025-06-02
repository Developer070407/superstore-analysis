const sparePartsService = require("../../services/sparePartsService")
const { SparePartModel } = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")


beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

jest.mock("../../models/model")

describe("Spare Parts Service", () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
    jest.clearAllMocks()
  })

  describe("getParts", () => {
    it("should return all spare parts", async () => {
      const mockParts = [
        { id: "part1", partName: "RAM", stock: 10, price: 50.0 },
        { id: "part2", partName: "SSD", stock: 5, price: 100.0 },
      ]

      SparePartModel.find.mockResolvedValue(mockParts)

      const result = await sparePartsService.getParts()

      expect(SparePartModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockParts)
    })
  })

  describe("createPart", () => {
    const partData = {
      partName: "RAM",
      stock: 10,
      price: 50.0,
      description: "DDR4 8GB RAM",
    }

    it("should create a spare part successfully", async () => {
      const mockPart = {
        id: "part123",
        ...partData,
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "part123", ...partData }),
      }

      SparePartModel.mockImplementation(() => mockPart)

      const result = await sparePartsService.createPart(
        partData.partName,
        partData.stock,
        partData.price,
        partData.description,
      )

      expect(mockPart.save).toHaveBeenCalled()
      expect(result).toEqual({ id: "part123", ...partData })
    })

    it("should handle database errors", async () => {
      const mockPart = {
        save: jest.fn().mockRejectedValue(new Error("Database error")),
      }

      SparePartModel.mockImplementation(() => mockPart)

      await expect(
        sparePartsService.createPart(partData.partName, partData.stock, partData.price, partData.description),
      ).rejects.toThrow()
    })
  })

  describe("getPart", () => {
    it("should return a specific spare part", async () => {
      const partId = "part123"
      const mockPart = { id: partId, partName: "RAM", stock: 10 }

      SparePartModel.findOne.mockResolvedValue(mockPart)

      const result = await sparePartsService.getPart(partId)

      expect(SparePartModel.findOne).toHaveBeenCalledWith({ id: partId })
      expect(result).toEqual(mockPart)
    })
  })

  describe("updatePart", () => {
    it("should update a spare part successfully", async () => {
      const partId = "part123"
      const updateData = { stock: 20, price: 60.0 }
      const mockUpdatedPart = { id: partId, ...updateData }

      SparePartModel.findOneAndUpdate.mockResolvedValue(mockUpdatedPart)

      const result = await sparePartsService.updatePart(updateData, partId)

      expect(SparePartModel.findOneAndUpdate).toHaveBeenCalledWith({ id: partId }, updateData, { new: true })
      expect(result).toEqual(mockUpdatedPart)
    })
  })

  describe("deletePart", () => {
    it("should delete a spare part successfully", async () => {
      const partId = "part123"

      SparePartModel.deleteOne.mockResolvedValue()

      await sparePartsService.deletePart(partId)

      expect(SparePartModel.deleteOne).toHaveBeenCalledWith({ id: partId })
    })
  })
})
