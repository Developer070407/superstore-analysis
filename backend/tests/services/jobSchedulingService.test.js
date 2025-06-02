const jobSchedulingService = require("../../services/jobSchedulingService")
const { JobsModel } = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

jest.mock("../../models/model")

describe("Job Scheduling Service", () => {
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

  describe("getJobs", () => {
    it("should return all jobs", async () => {
      const mockJobs = [
        { id: "job1", supportRequestId: "req1", technician: "John Doe" },
        { id: "job2", supportRequestId: "req2", technician: "Jane Smith" },
      ]

      JobsModel.find.mockResolvedValue(mockJobs)

      const result = await jobSchedulingService.getJobs()

      expect(JobsModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockJobs)
    })
  })

  describe("getJob", () => {
    it("should return a specific job", async () => {
      const jobId = "job123"
      const mockJob = { id: jobId, supportRequestId: "req123", technician: "John Doe" }

      JobsModel.findOne.mockResolvedValue(mockJob)

      const result = await jobSchedulingService.getJob(jobId)

      expect(JobsModel.findOne).toHaveBeenCalledWith({ id: jobId })
      expect(result).toEqual(mockJob)
    })
  })

  describe("createJob", () => {
    const jobData = {
      supportRequestId: "req123",
      technician: "John Doe",
      priority: "high",
      scheduledDate: "2024-12-31",
      completedAt: "2025-01-01",
    }

    it("should create a job successfully", async () => {
      const mockJob = {
        id: "job123",
        ...jobData,
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "job123", ...jobData }),
      }

      JobsModel.mockImplementation(() => mockJob)

      const result = await jobSchedulingService.createJob(
        jobData.supportRequestId,
        jobData.technician,
        jobData.priority,
        jobData.scheduledDate,
        jobData.completedAt,
      )

      expect(mockJob.save).toHaveBeenCalled()
      expect(result).toEqual({ id: "job123", ...jobData })
    })

    it("should handle database errors", async () => {
      const mockJob = {
        save: jest.fn().mockRejectedValue(new Error("Database error")),
      }

      JobsModel.mockImplementation(() => mockJob)

      await expect(
        jobSchedulingService.createJob(
          jobData.supportRequestId,
          jobData.technician,
          jobData.priority,
          jobData.scheduledDate,
          jobData.completedAt,
        ),
      ).rejects.toThrow()
    })
  })

  describe("updateJob", () => {
    it("should update a job successfully", async () => {
      const jobId = "job123"
      const updateData = { priority: "low", technician: "Jane Smith" }
      const mockUpdatedJob = { id: jobId, ...updateData }

      JobsModel.findOneAndUpdate.mockResolvedValue(mockUpdatedJob)

      const result = await jobSchedulingService.updateJob(updateData, jobId)

      expect(JobsModel.findOneAndUpdate).toHaveBeenCalledWith({ id: jobId }, updateData, { new: true })
      expect(result).toEqual(mockUpdatedJob)
    })
  })

  describe("deleteJob", () => {
    it("should delete a job successfully", async () => {
      const jobId = "job123"

      JobsModel.deleteOne.mockResolvedValue()

      await jobSchedulingService.deleteJob(jobId)

      expect(JobsModel.deleteOne).toHaveBeenCalledWith({ id: jobId })
    })
  })
})
