const supportRequestService = require("../../services/supportRequestService")
const { SupportRequestModel } = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

jest.mock("../../models/model")

describe("Support Request Service", () => {
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

  describe("createRequest", () => {
    const requestData = {
      userId: "user123",
      deviceType: "laptop",
      problemDescription: "Screen not working",
      quote: "",
      scheduledDate: "2024-12-31",
      status: "pending",
    }

    it("should create a support request successfully", async () => {
      const mockRequest = {
        id: "req123",
        ...requestData,
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "req123", ...requestData }),
      }

      SupportRequestModel.mockImplementation(() => mockRequest)

      const result = await supportRequestService.createRequest(
        requestData.userId,
        requestData.deviceType,
        requestData.problemDescription,
        requestData.quote,
        requestData.scheduledDate,
        requestData.status,
      )

      expect(mockRequest.save).toHaveBeenCalled()
      expect(result).toEqual({ id: "req123", ...requestData })
    })

    it("should handle database errors", async () => {
      const mockRequest = {
        save: jest.fn().mockRejectedValue(new Error("Database error")),
      }

      SupportRequestModel.mockImplementation(() => mockRequest)

      await expect(
        supportRequestService.createRequest(
          requestData.userId,
          requestData.deviceType,
          requestData.problemDescription,
          requestData.quote,
          requestData.scheduledDate,
          requestData.status,
        ),
      ).rejects.toThrow()
    })
  })

  describe("viewRequests", () => {
    it("should return all support requests", async () => {
      const mockRequests = [
        { id: "req1", deviceType: "laptop", userId: "user1" },
        { id: "req2", deviceType: "desktop", userId: "user2" },
      ]

      SupportRequestModel.find.mockResolvedValue(mockRequests)

      const result = await supportRequestService.viewRequests()

      expect(SupportRequestModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockRequests)
    })
  })

  describe("getUserRequests", () => {
    it("should return requests for specific user", async () => {
      const userId = "user123"
      const mockRequests = [
        { id: "req1", deviceType: "laptop", userId: userId },
        { id: "req2", deviceType: "tablet", userId: userId },
      ]

      SupportRequestModel.find.mockResolvedValue(mockRequests)

      const result = await supportRequestService.getUserRequests(userId)

      expect(SupportRequestModel.find).toHaveBeenCalledWith({ userId: userId })
      expect(result).toEqual(mockRequests)
    })
  })

  describe("viewRequest", () => {
    it("should return a specific request", async () => {
      const requestId = "req123"
      const mockRequest = { id: requestId, deviceType: "laptop" }

      SupportRequestModel.findOne.mockResolvedValue(mockRequest)

      const result = await supportRequestService.viewRequest(requestId)

      expect(SupportRequestModel.findOne).toHaveBeenCalledWith({ id: requestId })
      expect(result).toEqual(mockRequest)
    })
  })

  describe("updateUserRequest", () => {
    it("should update a request successfully", async () => {
      const requestId = "req123"
      const updateData = { status: "in-progress", quote: "$100" }
      const mockUpdatedRequest = { id: requestId, ...updateData }

      SupportRequestModel.findOneAndUpdate.mockResolvedValue(mockUpdatedRequest)

      const result = await supportRequestService.updateUserRequest(updateData, requestId)

      expect(SupportRequestModel.findOneAndUpdate).toHaveBeenCalledWith({ id: requestId }, updateData, { new: true })
      expect(result).toEqual(mockUpdatedRequest)
    })
  })

  describe("deleteUserRequest", () => {
    it("should delete a request successfully", async () => {
      const requestId = "req123"

      SupportRequestModel.deleteOne.mockResolvedValue()

      await supportRequestService.deleteUserRequest(requestId)

      expect(SupportRequestModel.deleteOne).toHaveBeenCalledWith({ id: requestId })
    })
  })
})
