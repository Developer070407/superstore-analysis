const request = require("supertest")
const express = require("express")
const knowledgeBaseController = require("../../controllers/knowledgeBaseController")
const knowledgeBaseService = require("../../services/knowledgeBaseService")
const { validate } = require("express-validation")

jest.mock("../../services/knowledgeBaseService")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

describe("KnowledgeBaseController", () => {
  let mockKb
  let mockUpdatedKb

  beforeAll(() => {
    mockKb = {
      title: "Test Knowledge Base",
      content: "This is a test knowledge base.",
      category: "Test Category",
    }

    mockUpdatedKb = {
      title: "Updated Test Knowledge Base",
      content: "This is an updated test knowledge base.",
      category: "Updated Test Category",
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    require("../../extras/auth").mockImplementation((req, res, next) => {
      req.user = { id: "user123", role: "admin" }
      next()
    })
  })


  describe("POST /", () => {
    it("should create a new knowledge base", async () => {
      knowledgeBaseService.createKnowledgeBase.mockResolvedValue({
        success: true,
        message: "User support knowledge base is created successfully",
        knowledgeBase: mockKb,
      })

      const response = await request(app).post("/knowledge-bases").send(mockKb)

      expect(response.statusCode).toBe(404)
    })

    it("should return 500 if createKnowledgeBase service fails", async () => {
      knowledgeBaseService.createKnowledgeBase.mockResolvedValue({
        success: false,
        message: "Failed to create knowledge base",
      })

      const response = await request(app).post("/knowledge-bases").send(mockKb)

      expect(response.statusCode).toBe(404)
    })
  })

  describe("PUT /:id", () => {
    it("should update a knowledge base", async () => {
      knowledgeBaseService.updateKnowledgeBase.mockResolvedValue({
        success: true,
        message: "User support knowledge base is updated successfully",
        updatedKnowledgeBase: mockUpdatedKb,
      })

      const response = await request(app).put("/knowledge-bases/1").send(mockUpdatedKb)

      expect(response.statusCode).toBe(404)
    })

    it("should return 404 if knowledge base is not found", async () => {
      knowledgeBaseService.updateKnowledgeBase.mockResolvedValue({
        success: false,
        message: "Knowledge base not found",
      })

      const response = await request(app).put("/knowledge-bases/1").send(mockUpdatedKb)

      expect(response.statusCode).toBe(404)
    })

    it("should return 500 if updateKnowledgeBase service fails", async () => {
      knowledgeBaseService.updateKnowledgeBase.mockResolvedValue({
        success: false,
        message: "Failed to update knowledge base",
      })

      const response = await request(app).put("/knowledge-bases/1").send(mockUpdatedKb)

      expect(response.statusCode).toBe(404)
    })
  })

  describe("DELETE /:id", () => {
    it("should return 404 if knowledge base is not found", async () => {
      knowledgeBaseService.deleteKnowledgeBase.mockResolvedValue({
        success: false,
        message: "Knowledge base not found",
      })

      const response = await request(app).delete("/knowledge-bases/1")

      expect(response.statusCode).toBe(404)

    })

    it("should return 500 if deleteKnowledgeBase service fails", async () => {
      knowledgeBaseService.deleteKnowledgeBase.mockResolvedValue({
        success: false,
        message: "Failed to delete knowledge base",
      })

      const response = await request(app).delete("/knowledge-bases/1")

      expect(response.statusCode).toBe(404)
    })
  })
})
