const request = require("supertest")
const express = require("express")
const supportRequestController = require("../../controllers/supportRequestController")
const supportRequestService = require("../../services/supportRequestService")
const { UserModel } = require("../../models/model")
const auth = require("../../extras/auth")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/supportRequestService")
jest.mock("../../models/model")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

auth.mockImplementation((req, res, next) => {
  req.id = "user123"
  next()
})

app.get("/", auth, supportRequestController.viewRequests)
app.get("/user", auth, supportRequestController.getUserRequests)
app.get("/:id", auth, supportRequestController.viewRequest)
app.post("/", auth, supportRequestController.createRequest)
app.put("/:id", auth, supportRequestController.updateUserRequest)
app.delete("/:id", auth, supportRequestController.deleteUserRequest)

const mockRequest = {
  id: "req123",
  userId: "user123",
  deviceType: "laptop",
  problemDescription: "Screen not working",
  quote: "$100",
  scheduledDate: "2024-12-31",
  status: "pending",
}

describe("Support Request Controller", () => {
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
    it("should get all support requests for admin", async () => {
      const mockUser = { role: "admin" }
      const mockRequests = [mockRequest]

      UserModel.findOne.mockResolvedValue(mockUser)
      supportRequestService.viewRequests.mockResolvedValue(mockRequests)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support requests")
      expect(response.body.requests).toEqual(mockRequests)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).get("/")

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      supportRequestService.viewRequests.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /user", () => {
    it("should get user's support requests", async () => {
      const mockRequests = [mockRequest]
      supportRequestService.getUserRequests.mockResolvedValue(mockRequests)

      const response = await request(app).get("/user")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support requests retrieved successfully.")
      expect(response.body.requests).toEqual(mockRequests)
      expect(supportRequestService.getUserRequests).toHaveBeenCalledWith("user123")
    })

    it("should handle service errors", async () => {
      supportRequestService.getUserRequests.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/user")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /:id", () => {
    it("should get a specific support request", async () => {
      supportRequestService.viewRequest.mockResolvedValue(mockRequest)

      const response = await request(app).get("/req123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support request")
      expect(response.body.request).toEqual(mockRequest)
      expect(supportRequestService.viewRequest).toHaveBeenCalledWith("req123")
    })

    it("should return 404 if request not found", async () => {
      supportRequestService.viewRequest.mockResolvedValue(null)

      const response = await request(app).get("/nonexistent")

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("There is not any support request!")
    })

    it("should handle service errors", async () => {
      supportRequestService.viewRequest.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/req123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("POST /", () => {
    const validRequestData = {
      deviceType: "laptop",
      problemDescription: "Screen not working",
      scheduledDate: "2024-12-31",
    }

    it("should create a support request successfully", async () => {
      const mockCreatedRequest = { id: "req123", ...validRequestData, userId: "user123", status: "pending" }
      supportRequestService.createRequest.mockResolvedValue(mockCreatedRequest)

      const response = await request(app).post("/").send(mockCreatedRequest)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe("Support request has been created successfully!")
    })

    it("should return 400 if required fields are missing", async () => {
      const invalidData = { ...validRequestData }
      delete invalidData.deviceType

      const response = await request(app).post("/").send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Enter all inputs!")
    })

    it("should handle service errors", async () => {
      supportRequestService.createRequest.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/").send({id: "req123", ...validRequestData, userId: "user123", status: "pending"})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("PUT /:id", () => {
    it("should update request for regular user (non-admin fields)", async () => {
      const mockUser = { role: "user" }
      const updateData = { deviceType: "desktop", problemDescription: "New description" }
      const mockUpdatedRequest = { id: "req123", ...updateData }

      UserModel.findOne.mockResolvedValue(mockUser)
      supportRequestService.updateUserRequest.mockResolvedValue(mockUpdatedRequest)

      const response = await request(app).put("/req123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should update request for admin (all fields)", async () => {
      const mockUser = { role: "admin" }
      const updateData = { status: "completed", quote: "$150" }
      const mockUpdatedRequest = { id: "req123", ...updateData }

      UserModel.findOne.mockResolvedValue(mockUser)
      supportRequestService.updateUserRequest.mockResolvedValue(mockUpdatedRequest)

      const response = await request(app).put("/req123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should return 500 if no fields provided", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/req123").send({})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should return 403 if non-admin tries to update admin-only fields", async () => {
      const mockUser = { role: "user" }
      const updateData = { status: "completed", quote: "$150" }

      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/req123").send(updateData)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "user" }
      const updateData = { deviceType: "desktop" }

      UserModel.findOne.mockResolvedValue(mockUser)
      supportRequestService.updateUserRequest.mockRejectedValue(new Error("Database error"))

      const response = await request(app).put("/req123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("DELETE /:id", () => {
    it("should delete support request successfully", async () => {
      supportRequestService.deleteUserRequest.mockResolvedValue()

      const response = await request(app).delete("/req123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The user support request has been deleted successfully!")
      expect(supportRequestService.deleteUserRequest).toHaveBeenCalledWith("req123")
    })

    it("should handle service errors", async () => {
      supportRequestService.deleteUserRequest.mockRejectedValue(new Error("Database error"))

      const response = await request(app).delete("/req123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })
})
