const request = require("supertest")
const express = require("express")
const jobSchedulingController = require("../../controllers/jobSchedulingController")
const jobSchedulingService = require("../../services/jobSchedulingService")
const { UserModel } = require("../../models/model")
const auth = require("../../extras/auth")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/jobSchedulingService")
jest.mock("../../models/model")
jest.mock("../../extras/auth")

const app = express()
app.use(express.json())

auth.mockImplementation((req, res, next) => {
  req.id = "user123"
  next()
})

app.get("/", auth, jobSchedulingController.getJobs)
app.get("/:id", auth, jobSchedulingController.getJob)
app.post("/", auth, jobSchedulingController.createJob)
app.put("/:id", auth, jobSchedulingController.updateJob)
app.delete("/:id", auth, jobSchedulingController.deleteJob)

const mockJob = {
  id: "job123",
  supportRequestId: "req123",
  technician: "John Doe",
  priority: "high",
  scheduledDate: "2024-12-31",
  completedAt: "2025-01-01",
}

describe("Job Scheduling Controller", () => {
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
    it("should get all jobs for admin", async () => {
      const mockUser = { role: "admin" }
      const mockJobs = [mockJob]

      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.getJobs.mockResolvedValue(mockJobs)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Jobs!")
      expect(response.body.jobs).toEqual(mockJobs)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).get("/")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Jobs!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.getJobs.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("GET /:id", () => {
    it("should get a specific job for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.getJob.mockResolvedValue(mockJob)

      const response = await request(app).get("/job123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support job")
      expect(response.body.job).toEqual(mockJob)
      expect(jobSchedulingService.getJob).toHaveBeenCalledWith("job123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).get("/job123")

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("User support job")
    })

    it("should return 404 if job not found", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.getJob.mockResolvedValue(null)

      const response = await request(app).get("/nonexistent")

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("There is not any job!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.getJob.mockRejectedValue(new Error("Database error"))

      const response = await request(app).get("/job123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("POST /", () => {
    const validJobData = {
      supportRequestId: "req123",
      technician: "John Doe",
      priority: "high",
      scheduledDate: "2024-12-31",
      completedAt: "2025-01-01",
    }

    it("should create job for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.createJob.mockResolvedValue(mockJob)

      const response = await request(app).post("/").send(validJobData)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe("Job has been created successfully!")
      expect(response.body.newJob).toEqual(mockJob)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).post("/").send(validJobData)

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if required fields are missing", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const invalidData = { ...validJobData }
      delete invalidData.supportRequestId

      const response = await request(app).post("/").send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Enter all inputs!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.createJob.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/").send(validJobData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("PUT /:id", () => {
    it("should update job for admin", async () => {
      const mockUser = { role: "admin" }
      const updateData = { priority: "low", technician: "Jane Smith" }
      const mockUpdatedJob = { id: "job123", ...updateData }

      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.updateJob.mockResolvedValue(mockUpdatedJob)

      const response = await request(app).put("/job123").send(updateData)

      expect(response.status).toBe(500)
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/job123").send({ priority: "low" })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should return 400 if no data provided", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).put("/job123").send({})

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.updateJob.mockRejectedValue(new Error("Database error"))

      const response = await request(app).put("/job123").send({ priority: "low" })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("DELETE /:id", () => {
    it("should delete job for admin", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.deleteJob.mockResolvedValue()

      const response = await request(app).delete("/job123")

      expect(response.status).toBe(202)
      expect(response.body.message).toBe("The job has been deleted successfully!")
      expect(jobSchedulingService.deleteJob).toHaveBeenCalledWith("job123")
    })

    it("should return 403 for non-admin users", async () => {
      const mockUser = { role: "user" }
      UserModel.findOne.mockResolvedValue(mockUser)

      const response = await request(app).delete("/job123")

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("This action cannot be done due to the wrong role of the user!")
    })

    it("should handle service errors", async () => {
      const mockUser = { role: "admin" }
      UserModel.findOne.mockResolvedValue(mockUser)
      jobSchedulingService.deleteJob.mockRejectedValue(new Error("Database error"))

      const response = await request(app).delete("/job123")

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })
})
