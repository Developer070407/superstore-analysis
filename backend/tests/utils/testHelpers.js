const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const UserModel = require("../../models/model").UserModel;

/**
 * Test helper utilities for backend testing
 */

/**
 * Generate a valid JWT token for testing
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration
 * @returns {string} JWT token
 */
const generateTestToken = (payload = { id: "test-user-id" }, secret = "test-secret", expiresIn = "1h") => {
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Generate a hashed password for testing
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const generateHashedPassword = async (password = "TestPassword123!") => {
  return await bcrypt.hash(password, 10)
}

/**
 * Create mock request object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock request object
 */
const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    id: "test-user-id",
    ...overrides,
  }
}

/**
 * Create mock response object
 * @returns {Object} Mock response object with jest functions
 */
const createMockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

/**
 * Create mock next function
 * @returns {Function} Mock next function
 */
const createMockNext = () => jest.fn()

/**
 * Generate test data for different models
 */
const testData = {
  user:{
    valid: {
      id: 'user123',
      name: 'Test User',
      email: 'user@example.com',
      password: 'UserPass123!',
      isBusiness: false,
      address: '123 Test St',
      role: 'user',
    },
    business: {
      id: "business-123",
      name: "Business User",
      email: "business@example.com",
      password: "BusinessPass123!",
      isBusiness: true,
      businessName: "Test Business LLC",
      address: "456 Business Ave",
      role: "user",
    },
    admin: {
      id: 'admin123',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      isBusiness: false,
      address: '456 Admin St',
      role: 'admin',
    },
  },
  supportRequest: {
    valid: {
      id: "req-123",
      userId: "user-123",
      deviceType: "laptop",
      problemDescription: "Screen not working properly",
      quote: "$150",
      scheduledDate: new Date("2024-12-31"),
      status: "pending",
    },
  },
  knowledgeBase: {
    valid: {
      id: "kb-123",
      title: "Laptop Screen Troubleshooting",
      symptoms: {
        0: "Screen flickering",
        1: "No display output",
        2: "Distorted colors",
      },
      solutionSteps: {
        0: "Check cable connections",
        1: "Update graphics drivers",
        2: "Test with external monitor",
      },
      category: "hardware",
    },
  },
  sparePart: {
    valid: {
      id: "part-123",
      partName: "RAM",
      stock: 25,
      price: 75.99,
      description: "DDR4 16GB Memory Module",
    },
  },
  job: {
    valid: {
      id: "job-123",
      supportRequestId: "req-123",
      technician: "John Technician",
      priority: "high",
      scheduledDate: new Date("2024-12-31"),
      completedAt: new Date("2025-01-02"),
    },
  },
  technician: {
    valid: {
      id: "tech-123",
      name: "Expert Technician",
    },
  },
}

/**
 * Validation test cases for different scenarios
 */
const validationTestCases = {
  email: {
    valid: ["test@example.com", "user.name@domain.co.uk", "test123@test-domain.com"],
    invalid: [
      "",
      "test",
      "test@",
      "@domain.com",
      "test..test@domain.com",
      ".test@domain.com",
      "test@domain.",
      "test@.domain.com",
      "test@domain..com",
      "test test@domain.com",
    ],
  },
  password: {
    valid: ["Password123!", "MySecure@Pass1", "Test#123ABC", "Strong$Pass9"],
    invalid: [
      "password123!", // no uppercase
      "Password!", // no number
      "Password123", // no special char
      "Pass1!", // too short
    ],
  },
  deviceTypes: {
    valid: ["laptop", "desktop", "tablet", "smartphone", "printer", "server"],
    invalid: ["invalid-device", "computer", "mobile"],
  },
  statuses: {
    valid: ["pending", "in-progress", "completed", "cancelled"],
    invalid: ["invalid-status", "done", "waiting"],
  },
  categories: {
    valid: ["hardware", "software", "network"],
    invalid: ["invalid-category", "general", "other"],
  },
  priorities: {
    valid: ["low", "medium", "high"],
    invalid: ["invalid-priority", "urgent", "normal"],
  },
  partNames: {
    valid: ["RAM", "SSD", "HDD", "CPU", "GPU", "Motherboard", "PSU", "Cooling Fan"],
    invalid: ["Invalid Part", "Memory", "Processor"],
  },
}

/**
 * Database operation helpers
 */
const dbHelpers = {
  /**
   * Create a user in the test database
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  createTestUser: async (userData = testData.user.valid) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await UserModel.create({
      ...userData,
      password: hashedPassword,
    });
    return await user.save()
  },

  /**
   * Create a support request in the test database
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>} Created request
   */
  createTestSupportRequest: async (requestData = testData.supportRequest.valid) => {
    const { SupportRequestModel } = require('../../models/model');
    await SupportRequestModel.create(requestData);
    return await request.save()
  },

  /**
   * Create multiple test records
   * @param {Function} Model - Mongoose model
   * @param {Array} dataArray - Array of data objects
   * @returns {Promise<Array>} Created records
   */
  createMultipleRecords: async (Model, dataArray) => {
    const promises = dataArray.map((data) => {
      const record = new Model(data)
      return record.save()
    })
    return await Promise.all(promises)
  },
}

/**
 * Error simulation helpers
 */
const errorHelpers = {
  /**
   * Create a database error
   * @param {string} message - Error message
   * @returns {Error} Database error
   */
  createDatabaseError: (message = "Database connection failed") => {
    const error = new Error(message)
    error.name = "MongoError"
    return error
  },

  /**
   * Create a validation error
   * @param {string} field - Field that failed validation
   * @returns {Error} Validation error
   */
  createValidationError: (field = "email") => {
    const error = new Error(`Validation failed for field: ${field}`)
    error.name = "ValidationError"
    return error
  },

  /**
   * Create a JWT error
   * @param {string} type - Type of JWT error
   * @returns {Error} JWT error
   */
  createJWTError: (type = "invalid") => {
    const error = new Error(`JWT ${type}`)
    error.name = type === "expired" ? "TokenExpiredError" : "JsonWebTokenError"
    return error
  },
}

module.exports = {
  generateTestToken,
  generateHashedPassword,
  createMockRequest,
  createMockResponse,
  createMockNext,
  testData,
  validationTestCases,
  dbHelpers,
  errorHelpers,
}
