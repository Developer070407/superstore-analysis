const auth = require("../../extras/auth")
const jwt = require("jsonwebtoken")

jest.mock("jsonwebtoken")

describe("Auth Middleware", () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {},
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  it("should authenticate valid token successfully", () => {
    const mockDecoded = { id: "user123" }
    req.headers.authorization = "Bearer valid-token"

    jwt.verify.mockReturnValue(mockDecoded)

    auth(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", process.env.ACCESS_TOKEN_SECRET)
    expect(req.id).toBe("user123")
    expect(next).toHaveBeenCalled()
  })

  it("should return 401 if no authorization header", () => {
    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      authHeader: undefined,
      message: "Access token missing or malformed",
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("should return 401 if authorization header does not start with Bearer", () => {
    req.headers.authorization = "Basic invalid-format"

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      authHeader: "Basic invalid-format",
      message: "Access token missing or malformed",
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("should return 403 for invalid token", () => {
    req.headers.authorization = "Bearer invalid-token"

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token")
    })

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("should return 403 for expired token", () => {
    req.headers.authorization = "Bearer expired-token"

    jwt.verify.mockImplementation(() => {
      const error = new Error("Token expired")
      error.name = "TokenExpiredError"
      throw error
    })

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    })
    expect(next).not.toHaveBeenCalled()
  })
})
