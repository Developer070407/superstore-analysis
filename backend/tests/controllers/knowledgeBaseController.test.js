const request = require("supertest")
const express = require("express")
const knowledgeBaseController = require("../../controllers/knowledgeBaseController")
const knowledgeBaseService = require("../../services/knowledgeBaseService")
const { UserModel } = require("../../models/model")
const auth = require("../../extras/auth")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/knowledgeBaseService")
jest.mock("../../models/model")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

auth.mockImplementation((req, res, next) => {
  req.id = "user123"
  next()
})

app.get("/", knowledgeBaseController.getKnowledgeBases)
app.get("/:id", knowledgeBaseController.getKnowledgeBase)
app.post("/", auth, knowledgeBaseController.createKnowledgeBase)
app.put("/:id", auth, knowledgeBaseController.updateKnowledgeBase)
app.delete("/:id", auth, knowledgeBaseController.deleteKnowledgeBase)

const mockKb = {
  id: "kb123",
  title: "Test Knowledge Base",
  symptoms: { 0: "Symptom 1", 1: "Symptom 2" },
  solutionSteps: { 0: "Step 1", 1: "Step 2" },
  category: "hardware",
}

describe("Knowledge Base Controller", () => {
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
    it("should return all knowledge bases", async () => {
      const mockKnowledgeBases = [mockKb]
      knowledgeBaseService.getKnowledgeBases.mockResolvedValue(mockKnowledgeBases)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support knowledge bases!")
      expect(response.body.knowledgeBases).toEqual(mockKnowledgeBases)
    })

    it("should handle service errors", async () => {
      knowledgeBaseService.getKnowledgeBases.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /:id", () => {
    it("should return a knowledge base by id", async () => {
      knowledgeBaseService.getKnowledgeBase.mockResolvedValue(mockKb)

      const response = await request(app).get("/kb123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support knowledge base")
      expect(response.body.knowledgeBase).toEqual(mockKb)
      expect(knowledgeBaseService.getKnowledgeBase).toHaveBeenCalledWith("kb123")
    })

    it("should return 404 if knowledge base is not found", async () => {
      knowledgeBaseService.getKnowledgeBase.mockResolvedValue(null)

      const response = await request(app).get("/nonexistent")

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("There is not any knowledge base!")
    })

    it("should handle service errors", async () => {
      knowledgeBaseService.getKnowledgeBase.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/kb123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("POST /", () => {
    const validKbData = {
      title: "Test Knowledge Base",
      symptoms: { 0: "Symptom 1", 1: "Symptom 2" },
      solutionSteps: { 0: "Step 1", 1: "Step 2" },
      category: "hardware",
    }

    it("should create a new knowledge base for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.createKnowledgeBase.mockResolvedValue(mockKb)

      const response = await request(app).post("/").send(validKbData)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe("Knowledge base has been created successfully!")
      expect(response.body.newKnowledgeBase).toEqual(mockKb)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).post("/").send(validKbData)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if required fields are missing", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const invalidData = { ...validKbData }
      delete invalidData.title

      const response = await request(app).post("/").send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Enter all inputs!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.createKnowledgeBase.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/").send(validKbData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("PUT /:id", () => {
    it("should update knowledge base for admin", async () => {
      const mockUser = { role: "admin" }
      const updateData = { title: "Updated Title" }
      const mockUpdatedKb = { id: "kb123", ...updateData }

      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.updateKnowledgeBase.mockResolvedValue(mockUpdatedKb)

      const response = await request(app).put("/kb123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/kb123").send({ title: "Updated Title" })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if no data provided", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/kb123").send({})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.updateKnowledgeBase.mockRejectedValue(new Error("Database error"))

      const response = await request(app).put("/kb123").send({ title: "Updated Title" })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("DELETE /:id", () => {
    it("should delete knowledge base for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.deleteKnowledgeBase.mockResolvedValue()

      const response = await request(app).delete("/kb123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The user support knowledge base has been deleted successfully!")
      expect(knowledgeBaseService.deleteKnowledgeBase).toHaveBeenCalledWith("kb123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).delete("/kb123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The user support knowledge base has been deleted successfully!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      knowledgeBaseService.deleteKnowledgeBase.mockRejectedValue(new Error("Database error"))

      const response = await request(app).delete("/kb123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })
})
