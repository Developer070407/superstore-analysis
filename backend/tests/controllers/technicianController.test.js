const request = require("supertest")
const express = require("express")
const userController = require("../../controllers/userController")
const userService = require("../../services/userService")
const { UserModel } = require("../../models/model")
const auth = require("../../extras/auth")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/userService")
jest.mock("../../models/model")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

auth.mockImplementation((req, res, next) => {
  req.id = "user123"
  next()
})

app.get("/", auth, userController.getUsers)
app.get("/:id", auth, userController.getUser)
app.put("/:id", auth, userController.updateUser)
app.delete("/:id", auth, userController.deleteUser)

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  isBusiness: false,
  address: "123 Main St",
}

describe("User Controller", () => {
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
    it("should get all users for admin", async () => {
      const mockCurrentUser = { role: "admin" }
      const mockUsers = [mockUser]

      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.getUsers.mockResolvedValue(mockUsers)

      const response = await request(app).get("/")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("Here are all users!")
      expect(response.body.users).toEqual(mockUsers)
    })

    it("should return 403 for non-admin users", async () => {
      const mockCurrentUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)

      const response = await request(app).get("/")

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should handle service errors", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.getUsers.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /:id", () => {
    it("should get a specific user for admin", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.getUser.mockResolvedValue(mockUser)

      const response = await request(app).get("/user123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("User info")
      expect(response.body.user).toEqual(mockUser)
      expect(userService.getUser).toHaveBeenCalledWith("user123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockCurrentUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)

      const response = await request(app).get("/user123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("User info")
    })

    it("should return 404 if user not found", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.getUser.mockResolvedValue(null)

      const response = await request(app).get("/nonexistent")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("User info")
    })

    it("should handle service errors", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.getUser.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/user123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("PUT /:id", () => {
    it("should update user successfully", async () => {
      const updateData = { name: "John Updated", email: "john.updated@example.com" }
      const mockUpdatedUser = { id: "user123", ...updateData }

      userService.updateUser.mockResolvedValue(mockUpdatedUser)

      const response = await request(app).put("/user123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should return 403 if no data provided", async () => {
      const response = await request(app).put("/user123").send({})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should handle service errors", async () => {
      const updateData = { name: "John Updated" }
      userService.updateUser.mockRejectedValue(new Error("Database error"))

      const response = await request(app).put("/user123").send(updateData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("DELETE /:id", () => {
    it("should delete user for admin", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.deleteUser.mockResolvedValue()

      const response = await request(app).delete("/user123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The user has been deleted successfully!")
      expect(userService.deleteUser).toHaveBeenCalledWith("user123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockCurrentUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)

      const response = await request(app).delete("/user123")

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should handle service errors", async () => {
      const mockCurrentUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockCurrentUser)
      userService.deleteUser.mockRejectedValue(new Error("Database error"))

      const response = await request(app).delete("/user123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })
})
