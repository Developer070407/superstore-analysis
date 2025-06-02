const authService = require("../../services/authenticationService")
const { UserModel } = require("../../models/model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")

jest.mock("../../models/model")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")

describe("Authentication Service", () => {
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

  describe("register", () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      isBusiness: false,
      address: "123 Main St",
      businessName: "",
    }

    it("should register a user successfully", async () => {
      const hashedPassword = "hashedPassword123"
      const mockUser = {
        id: "user123",
        ...userData,
        password: hashedPassword,
        role: "user",
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "user123", ...userData }),
      }

      bcrypt.hash.mockResolvedValue(hashedPassword)
      UserModel.mockImplementation(() => mockUser)

      const result = await authService.register(
        userData.name,
        userData.email,
        userData.password,
        userData.isBusiness,
        userData.address,
        userData.businessName,
      )

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10)
      expect(mockUser.save).toHaveBeenCalled()
      expect(result).toEqual({ id: "user123", ...userData })
    })

    it("should register a business user successfully", async () => {
      const businessUserData = {
        ...userData,
        isBusiness: true,
        businessName: "Test Business",
      }
      const hashedPassword = "hashedPassword123"
      const mockUser = {
        id: "user123",
        ...businessUserData,
        password: hashedPassword,
        role: "user",
        save: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: "user123", ...businessUserData }),
      }

      bcrypt.hash.mockResolvedValue(hashedPassword)
      UserModel.mockImplementation(() => mockUser)

      const result = await authService.register(
        businessUserData.name,
        businessUserData.email,
        businessUserData.password,
        businessUserData.isBusiness,
        businessUserData.address,
        businessUserData.businessName,
      )

      expect(result).toEqual({ id: "user123", ...businessUserData })
    })

  })

  describe("login", () => {
    const loginData = {
      email: "john@example.com",
      password: "Password123!",
    }

    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user123",
        email: loginData.email,
        password: "hashedPassword",
      }
      const mockToken = "jwt-token"

      UserModel.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue(mockToken)

      const result = await authService.login(loginData.email, loginData.password)

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: loginData.email })
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password)
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      expect(result).toEqual({
        token: mockToken,
        id: mockUser.id,
        foundUser: mockUser,
      })
    })

    it("should return null for non-existent user", async () => {
      UserModel.findOne.mockResolvedValue(null)

      const result = await authService.login(loginData.email, loginData.password)

      expect(result).toBeNull()
    })

    it("should return null for invalid password", async () => {
      const mockUser = {
        id: "user123",
        email: loginData.email,
        password: "hashedPassword",
      }

      UserModel.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)

      const result = await authService.login(loginData.email, loginData.password)

      expect(result).toBeNull()
    })
  })

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      const user = { id: "user123" }
      const accessToken = "access-token"
      const refreshToken = "refresh-token"

      jwt.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken)

      const result = authService.generateTokens(user)

      expect(jwt.sign).toHaveBeenCalledWith({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
      expect(jwt.sign).toHaveBeenCalledWith({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })
      expect(result).toEqual({ accessToken, refreshToken })
    })
  })

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", () => {
      const token = "valid-refresh-token"
      const userData = { id: "user123" }

      jwt.verify.mockReturnValue(userData)

      const result = authService.verifyRefreshToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.REFRESH_TOKEN_SECRET)
      expect(result).toEqual(userData)
    })

    it("should throw error for invalid refresh token", () => {
      const token = "invalid-refresh-token"

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token")
      })

      expect(() => authService.verifyRefreshToken(token)).toThrow("Invalid or expired refresh token")
    })
  })

  describe("checkEmail", () => {
    it("should return true for valid email", () => {
      const validEmails = ["test@example.com", "user.name@domain.co.uk", "test123@test-domain.com"]

      validEmails.forEach((email) => {
        expect(authService.checkEmail(email)).toBe(true)
      })
    })

    it("should return null for invalid email formats", () => {
      const invalidEmails = [
        "",
        "test",
        "test@",
        "@domain.com",
        "test..test@domain.com",
        ".test@domain.com",
        "test@domain.",
        "test@.domain.com",
        "test@domain..com",
        "test(test)@domain.com",
        "test,test@domain.com",
        "test:test@domain.com",
        "test;test@domain.com",
        "test<test@domain.com",
        "test>test@domain.com",
        "test[test]@domain.com",
        "test test@domain.com",
      ]

      invalidEmails.forEach((email) => {
        expect(authService.checkEmail(email)).toBeNull()
      })
    })

    it("should return null for emails that are too short or too long", () => {
      const shortEmail = "a@b.c"
      const longEmail = "a".repeat(320) + "@domain.com"

      expect(authService.checkEmail(shortEmail)).toBeNull()
      expect(authService.checkEmail(longEmail)).toBeNull()
    })
  })

  describe("checkPassword", () => {
    it("should return true for valid passwords", () => {
      const validPasswords = ["Password123!", "MySecure@Pass1", "Test#123ABC", "Strong$Pass9"]

      validPasswords.forEach((password) => {
        expect(authService.checkPassword(password)).toBe(true)
      })
    })

    it("should return null for passwords without uppercase letter", () => {
      const password = "password123!"
      expect(authService.checkPassword(password)).toBeNull()
    })

    it("should return null for passwords without number", () => {
      const password = "Password!"
      expect(authService.checkPassword(password)).toBeNull()
    })

    it("should return null for passwords without special character", () => {
      const password = "Password123"
      expect(authService.checkPassword(password)).toBeNull()
    })

    it("should return null for passwords that are too short", () => {
      const password = "Pass1!"
      expect(authService.checkPassword(password)).toBeNull()
    })
  })
})
