const mongoose = require("mongoose")
const {
  UserModel,
  SupportRequestModel,
  KnowledgeBaseModel,
  SparePartModel,
  JobsModel,
  TechnicianModel,
  UpdateRequestSchema,
  UpdateUserSchema,
  UpdateKnowledgeBaseSchema,
  UpdateJobSchema,
  UpdatePartSchema,
} = require("../../models/model")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

describe("Models", () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  describe("UserModel", () => {
    it("should create a valid user", async () => {
      const userData = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        isBusiness: false,
        address: "123 Main St",
        role: "user",
      }

      const user = new UserModel(userData)
      const savedUser = await user.save()

      expect(savedUser.id).toBe(userData.id)
      expect(savedUser.name).toBe(userData.name)
      expect(savedUser.email).toBe(userData.email)
      expect(savedUser.role).toBe(userData.role)
    })

    it("should create a valid business user", async () => {
      const businessUserData = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        isBusiness: true,
        businessName: "Test Business",
        address: "123 Main St",
        role: "user",
      }

      const user = new UserModel(businessUserData)
      const savedUser = await user.save()

      expect(savedUser.isBusiness).toBe(true)
      expect(savedUser.businessName).toBe(businessUserData.businessName)
    })

    it("should require businessName for business users", async () => {
      const userData = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        isBusiness: true,
        address: "123 Main St",
        role: "user",
      }

      const user = new UserModel(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it("should enforce unique email constraint", async () => {
      const userData1 = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        isBusiness: false,
        address: "123 Main St",
        role: "user",
      }

      const userData2 = {
        id: "user456",
        name: "Jane Doe",
        email: "john@example.com", // Same email
        password: "hashedPassword",
        isBusiness: false,
        address: "456 Oak St",
        role: "user",
      }

      const user1 = new UserModel(userData1)
      await user1.save()

      const user2 = new UserModel(userData2)
      await expect(user2.save()).rejects.toThrow()
    })
  })

  describe("SupportRequestModel", () => {
    it("should create a valid support request", async () => {
      const requestData = {
        id: "req123",
        userId: "user123",
        deviceType: "laptop",
        problemDescription: "Screen not working",
        quote: "$100",
        scheduledDate: new Date("2024-12-31"),
        status: "pending",
      }

      const request = new SupportRequestModel(requestData)
      const savedRequest = await request.save()

      expect(savedRequest.id).toBe(requestData.id)
      expect(savedRequest.deviceType).toBe(requestData.deviceType)
      expect(savedRequest.status).toBe(requestData.status)
    })

    it("should validate device type enum", async () => {
      const requestData = {
        id: "req123",
        userId: "user123",
        deviceType: "invalid-device",
        problemDescription: "Screen not working",
        scheduledDate: new Date("2024-12-31"),
        status: "pending",
      }

      const request = new SupportRequestModel(requestData)
      await expect(request.save()).rejects.toThrow()
    })

    it("should validate status enum", async () => {
      const requestData = {
        id: "req123",
        userId: "user123",
        deviceType: "laptop",
        problemDescription: "Screen not working",
        scheduledDate: new Date("2024-12-31"),
        status: "invalid-status",
      }

      const request = new SupportRequestModel(requestData)
      await expect(request.save()).rejects.toThrow()
    })
  })

  describe("KnowledgeBaseModel", () => {
    it("should create a valid knowledge base article", async () => {
      const kbData = {
        id: "kb123",
        title: "Test Article",
        symptoms: { 0: "Symptom 1", 1: "Symptom 2" },
        solutionSteps: { 0: "Step 1", 1: "Step 2" },
        category: "hardware",
      }

      const kb = new KnowledgeBaseModel(kbData)
      const savedKb = await kb.save()

      expect(savedKb.id).toBe(kbData.id)
      expect(savedKb.title).toBe(kbData.title)
      expect(savedKb.category).toBe(kbData.category)
    })

    it("should validate category enum", async () => {
      const kbData = {
        id: "kb123",
        title: "Test Article",
        symptoms: { 0: "Symptom 1" },
        solutionSteps: { 0: "Step 1" },
        category: "invalid-category",
      }

      const kb = new KnowledgeBaseModel(kbData)
      await expect(kb.save()).rejects.toThrow()
    })
  })

  describe("SparePartModel", () => {
    it("should create a valid spare part", async () => {
      const partData = {
        id: "part123",
        partName: "RAM",
        stock: 10,
        price: 50.0,
        description: "DDR4 8GB RAM",
      }

      const part = new SparePartModel(partData)
      const savedPart = await part.save()

      expect(savedPart.id).toBe(partData.id)
      expect(savedPart.partName).toBe(partData.partName)
      expect(savedPart.stock).toBe(partData.stock)
      expect(savedPart.price).toBe(partData.price)
    })

    it("should validate partName enum", async () => {
      const partData = {
        id: "part123",
        partName: "Invalid Part",
        stock: 10,
        price: 50.0,
        description: "Invalid part",
      }

      const part = new SparePartModel(partData)
      await expect(part.save()).rejects.toThrow()
    })
  })

  describe("JobsModel", () => {
    it("should create a valid job", async () => {
      const jobData = {
        id: "job123",
        supportRequestId: "req123",
        technician: "John Doe",
        priority: "high",
        scheduledDate: new Date("2024-12-31"),
        completedAt: new Date("2025-01-01"),
      }

      const job = new JobsModel(jobData)
      const savedJob = await job.save()

      expect(savedJob.id).toBe(jobData.id)
      expect(savedJob.supportRequestId).toBe(jobData.supportRequestId)
      expect(savedJob.priority).toBe(jobData.priority)
    })

    it("should validate priority enum", async () => {
      const jobData = {
        id: "job123",
        supportRequestId: "req123",
        technician: "John Doe",
        priority: "invalid-priority",
        scheduledDate: new Date("2024-12-31"),
        completedAt: new Date("2025-01-01"),
      }

      const job = new JobsModel(jobData)
      await expect(job.save()).rejects.toThrow()
    })
  })

  describe("TechnicianModel", () => {
    it("should create a valid technician", async () => {
      const techData = {
        id: "tech123",
        name: "John Doe",
      }

      const technician = new TechnicianModel(techData)
      const savedTechnician = await technician.save()

      expect(savedTechnician.id).toBe(techData.id)
      expect(savedTechnician.name).toBe(techData.name)
    })
  })

  describe("Validation Schemas", () => {
    describe("UpdateRequestSchema", () => {
      it("should validate valid update data", () => {
        const validData = {
          deviceType: "laptop",
          problemDescription: "Updated description",
          status: "in-progress",
        }

        const { error } = UpdateRequestSchema.validate(validData)
        expect(error).toBeUndefined()
      })

      it("should reject invalid device type", () => {
        const invalidData = {
          deviceType: "invalid-device",
        }

        const { error } = UpdateRequestSchema.validate(invalidData)
        expect(error).toBeDefined()
      })

      it("should reject invalid status", () => {
        const invalidData = {
          status: "invalid-status",
        }

        const { error } = UpdateRequestSchema.validate(invalidData)
        expect(error).toBeDefined()
      })
    })

    describe("UpdateUserSchema", () => {
      it("should validate valid user update data", () => {
        const validData = {
          name: "Updated Name",
          email: "updated@example.com",
        }

        const { error } = UpdateUserSchema.validate(validData)
        expect(error).toBeUndefined()
      })
    })

    describe("UpdateKnowledgeBaseSchema", () => {
      it("should validate valid knowledge base update data", () => {
        const validData = {
          title: "Updated Title",
          category: "software",
        }

        const { error } = UpdateKnowledgeBaseSchema.validate(validData)
        expect(error).toBeUndefined()
      })

      it("should reject invalid category", () => {
        const invalidData = {
          category: "invalid-category",
        }

        const { error } = UpdateKnowledgeBaseSchema.validate(invalidData)
        expect(error).toBeDefined()
      })
    })

    describe("UpdateJobSchema", () => {
      it("should validate valid job update data", () => {
        const validData = {
          priority: "low",
          technician: "Jane Smith",
        }

        const { error } = UpdateJobSchema.validate(validData)
        expect(error).toBeUndefined()
      })

      it("should reject invalid priority", () => {
        const invalidData = {
          priority: "invalid-priority",
        }

        const { error } = UpdateJobSchema.validate(invalidData)
        expect(error).toBeDefined()
      })
    })

    describe("UpdatePartSchema", () => {
      it("should validate valid part update data", () => {
        const validData = {
          partName: "SSD",
          stock: 15,
          price: 120.0,
        }

        const { error } = UpdatePartSchema.validate(validData)
        expect(error).toBeUndefined()
      })

      it("should reject invalid part name", () => {
        const invalidData = {
          partName: "Invalid Part Name",
        }

        const { error } = UpdatePartSchema.validate(invalidData)
        expect(error).toBeDefined()
      })
    })
  })
})
