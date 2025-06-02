const userService = require("../../services/userService")
const { UserModel } = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

// Mock the model
jest.mock("../../models/model")

describe("User Service", () => {
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

  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com" },
      ]

      UserModel.find.mockResolvedValue(mockUsers)

      const result = await userService.getUsers()

      expect(UserModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockUsers)
    })
  })

  describe("getUser", () => {
    it("should return a specific user", async () => {
      const userId = "user123"
      const mockUser = { id: userId, name: "John Doe", email: "john@example.com" }

      UserModel.findOne.mockResolvedValue(mockUser)

      const result = await userService.getUser(userId)

      expect(UserModel.findOne).toHaveBeenCalledWith({ id: userId })
      expect(result).toEqual(mockUser)
    })
  })

  describe("updateUser", () => {
    it("should update a user successfully", async () => {
      const userId = "user123"
      const updateData = { name: "John Updated", email: "john.updated@example.com" }
      const mockUpdatedUser = { id: userId, ...updateData }

      UserModel.findOneAndUpdate.mockResolvedValue(mockUpdatedUser)

      const result = await userService.updateUser(updateData, userId)

      expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith({ id: userId }, updateData, { new: true })
      expect(result).toEqual(mockUpdatedUser)
    })
  })

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      const userId = "user123"

      UserModel.deleteOne.mockResolvedValue()

      await userService.deleteUser(userId)

      expect(UserModel.deleteOne).toHaveBeenCalledWith({ id: userId })
    })
  })
})
