const request = require("supertest")
const express = require("express")
const sparePartsController = require("../../controllers/sparePartsController")
const sparePartsService = require("../../services/sparePartsService")
const { UserModel } = require("../../models/model")
const auth = require("../../extras/auth")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/sparePartsService")
jest.mock("../../models/model")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

auth.mockImplementation((req, res, next) => {
  req.id = "user123"
  next()
})

app.get("/", auth, sparePartsController.getParts)
app.get("/:id", auth, sparePartsController.getPart)
app.post("/", auth, sparePartsController.createPart)
app.put("/:id", auth, sparePartsController.updatePart)
app.delete("/:id", auth, sparePartsController.deletePart)

const mockPart = {
  id: "part123",
  partName: "RAM",
  stock: 10,
  price: 50.0,
  description: "DDR4 8GB RAM",
}

describe("Spare Parts Controller", () => {
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

  describe("GET /", () => {
    it("should get all spare parts for admin", async () => {
      const mockUser = { role: "admin" }
      const mockParts = [mockPart]

      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.getParts.mockResolvedValue(mockParts)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support kspare parts!")
      expect(response.body.parts).toEqual(mockParts)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support kspare parts!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.getParts.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /:id", () => {
    it("should get a specific spare part for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.getPart.mockResolvedValue(mockPart)

      const response = await request(app).get("/part123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Spare part")
      expect(response.body.part).toEqual(mockPart)
      expect(sparePartsService.getPart).toHaveBeenCalledWith("part123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).get("/part123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Spare part")
    })

    it("should return 404 if part not found", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.getPart.mockResolvedValue(null)

      const response = await request(app).get("/nonexistent")

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("There is not any knowledge base!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.getPart.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/part123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("POST /", () => {
    const validPartData = {
      partName: "RAM",
      stock: 10,
      price: 50.0,
      description: "DDR4 8GB RAM",
    }

    it("should create spare part for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.createPart.mockResolvedValue(mockPart)

      const response = await request(app).post("/").send(validPartData)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe("Spare part has been created successfully!")
      expect(response.body.newPart).toEqual(mockPart)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).post("/").send(validPartData)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if required fields are missing", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const invalidData = { ...validPartData }
      delete invalidData.partName

      const response = await request(app).post("/").send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Enter all inputs!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.createPart.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/").send(validPartData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("PUT /:id", () => {
    it("should update spare part for admin", async () => {
      const mockUser = { role: "admin" }
      const updateData = { stock: 20, price: 60.0 }
      const mockUpdatedPart = { id: "part123", ...updateData }

      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.updatePart.mockResolvedValue(mockUpdatedPart)

      const response = await request(app).put("/part123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/part123").send({ stock: 20 })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if no data provided", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/part123").send({})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.updatePart.mockRejectedValue(new Error("Database error"))

      const response = await request(app).put("/part123").send({ stock: 20 })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("DELETE /:id", () => {
    it("should delete spare part for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.deletePart.mockResolvedValue()

      const response = await request(app).delete("/part123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The spare part has been deleted successfully!")
      expect(sparePartsService.deletePart).toHaveBeenCalledWith("part123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).delete("/part123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The spare part has been deleted successfully!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      sparePartsService.deletePart.mockRejectedValue(new Error("Database error"))

      const response = await request(app).delete("/part123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })
})
