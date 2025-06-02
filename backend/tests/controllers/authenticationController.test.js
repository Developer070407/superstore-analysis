const request = require("supertest")
const express = require("express")
const authController = require("../../controllers/authenticationController")
const userService = require("../../services/authenticationService")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../services/authenticationService")

const app = express()
app.use(express.json())
app.post("/register", authController.register)
app.post("/login", authController.login)
app.post("/refresh", authController.refreshToken)

describe("Authentication Controller", () => {
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

  describe("POST /register", () => {
    const validUserData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      isBusiness: false,
      address: "123 Main St",
      businessName: "",
    }

    it("should register a user successfully", async () => {
      const mockUser = { id: "123", ...validUserData }
      userService.checkEmail.mockReturnValue(true)
      userService.checkPassword.mockReturnValue(true)
      userService.register.mockResolvedValue(mockUser)

      const response = await request(app).post("/register").send(validUserData)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe("User registered successfully!")
      expect(response.body.newUser).toEqual(mockUser)
    })

    it("should return 400 if required fields are missing", async () => {
      const invalidData = { ...validUserData }
      delete invalidData.name

      const response = await request(app).post("/register").send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Enter all inputs!")
    })

    it("should return 400 if business name is missing for business account", async () => {
      const businessData = {
        ...validUserData,
        isBusiness: true,
        businessName: "",
      }

      const response = await request(app).post("/register").send(businessData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Business name is required for business accounts!")
    })

    it("should return 400 for invalid email", async () => {
      userService.checkEmail.mockReturnValue(false)

      const response = await request(app).post("/register").send(validUserData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe("Invalid Email!")
    })

    it("should return 400 for invalid password", async () => {
      userService.checkEmail.mockReturnValue(true)
      userService.checkPassword.mockReturnValue(false)

      const response = await request(app).post("/register").send(validUserData)

      expect(response.status).toBe(400)
      expect(response.body.message).toBe(
        "Invalid Password! Password must include at least one uppercase letter, special character, and number.",
      )
    })

    it("should handle service errors", async () => {
      userService.checkEmail.mockReturnValue(true)
      userService.checkPassword.mockReturnValue(true)
      userService.register.mockRejectedValue(new Error("Database error"))

      const response = await request(app).post("/register").send(validUserData)

      expect(response.status).toBe(500)
      expect(response.body.message).toBe("Internal Server Error")
    })
  })

  describe("POST /login", () => {
    const loginData = {
      email: "john@example.com",
      password: "Password123!",
    }

    it("should login successfully", async () => {
      const mockLoginData = {
        token: "mock-token",
        id: "123",
        foundUser: { id: "123", email: "john@example.com" },
      }
      userService.login.mockResolvedValue(mockLoginData)

      const response = await request(app).post("/login").send(loginData)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Login successful!")
      expect(response.body.data).toEqual(mockLoginData)
    })

    it("should return 401 for invalid credentials", async () => {
      userService.login.mockResolvedValue(null)

      const response = await request(app).post("/login").send(loginData)

      expect(response.status).toBe(401)
      expect(response.body.message).toBe("Invalid credentials")
    })
  })

  describe("POST /refresh", () => {
    it("should refresh token successfully", async () => {
      const mockUserData = { id: "123" }
      const mockTokens = { accessToken: "new-access-token", refreshToken: "new-refresh-token" }

      userService.verifyRefreshToken.mockReturnValue(mockUserData)
      userService.generateTokens.mockReturnValue(mockTokens)

      const response = await request(app).post("/refresh").send({ refreshToken: "valid-refresh-token" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockTokens)
    })

    it("should return 401 if no refresh token provided", async () => {
      const response = await request(app).post("/refresh").send({})

      expect(response.status).toBe(401)
      expect(response.body.message).toBe("No refresh token provided")
    })

    it("should return 403 for invalid refresh token", async () => {
      userService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token")
      })

      const response = await request(app).post("/refresh").send({ refreshToken: "invalid-token" })

      expect(response.status).toBe(403)
      expect(response.body.message).toBe("Invalid or expired refresh token")
    })
  })
})
