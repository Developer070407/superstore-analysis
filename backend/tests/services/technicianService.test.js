const technicianService = require("../../services/technicianService")
const { TechnicianModel } = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// Mock the model
jest.mock("../../models/model")

describe("Technician Service", () => {
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

  describe("getTechnicians", () => {
    it("should return all technicians", async () => {
      const mockTechnicians = [
        { id: "tech1", name: "John Doe" },
        { id: "tech2", name: "Jane Smith" },
      ]

      TechnicianModel.find.mockResolvedValue(mockTechnicians)

      const result = await technicianService.getTechnicians()

      expect(TechnicianModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockTechnicians)
    })
  })

  describe("createTechnician", () => {
    const technicianData = {
      name: "John Doe",
    }

    it("should create a technician successfully", async () => {
      const mockTechnician = {
        id: "tech123",
        ...technicianData,
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "tech123", ...technicianData }),
      }

      TechnicianModel.mockImplementation(() => mockTechnician)

      const result = await technicianService.createTechnician(technicianData.name)

      expect(mockTechnician.save).toHaveBeenCalled()
      expect(result).toEqual({ id: "tech123", ...technicianData })
    })

    it("should handle database errors", async () => {
      const mockTechnician = {
        save: jest.fn().mockRejectedValue(new Error("Database error")),
      }

      TechnicianModel.mockImplementation(() => mockTechnician)

      await expect(technicianService.createTechnician(technicianData.name)).rejects.toThrow()
    })
  })

  describe("deleteTechnician", () => {
    it("should delete a technician successfully", async () => {
      const technicianId = "tech123"

      TechnicianModel.deleteOne.mockResolvedValue()

      await technicianService.deleteTechnician(technicianId)

      expect(TechnicianModel.deleteOne).toHaveBeenCalledWith({ id: technicianId })
    })
  })
})
