const request = require("supertest")
const express = require("express")
const { setupTestDB, teardownTestDB, clearTestDB } = require("../setup")
const { testData, dbHelpers } = require("../utils/testHelpers")
const { describe, beforeAll, afterAll, beforeEach, it, expect } = require("@jest/globals")

// Import routes
const authRoute = require("../../routers/authenticationRoute")
const requestRoute = require("../../routers/supportRequestRoute")

// Create test app
const app = express()
app.use(express.json())
app.use("/auth", authRoute)
app.use("/request", requestRoute)

describe("Performance Tests", () => {
  let userToken

  beforeAll(async () => {
    await setupTestDB()

    // Create and login user
    const userData = testData.user.valid
    await dbHelpers.createTestUser(userData)

    const loginResponse = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    })

    userToken = loginResponse.body.data.token
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  beforeEach(async () => {
    await clearTestDB()
  })

  describe("Concurrent Request Handling", () => {
    it("should handle multiple concurrent login requests", async () => {
      const concurrentRequests = 10
      const loginData = {
        email: testData.user.valid.email,
        password: testData.user.valid.password,
      }

      await dbHelpers.createTestUser()

      const startTime = Date.now()

      const requests = Array(concurrentRequests)
        .fill()
        .map(() => request(app).post("/auth/login").send(loginData))

      const responses = await Promise.all(requests)

      const endTime = Date.now()
      const totalTime = endTime - startTime

      responses.forEach((response) => {
        expect(response.status).toBe(200)
        expect(response.body.data.token).toBeDefined()
      })

      expect(totalTime).toBeLessThan(5000) // 5 seconds for 10 concurrent requests

      console.log(`✅ ${concurrentRequests} concurrent login requests completed in ${totalTime}ms`)
    })

    it("should handle multiple concurrent support request creations", async () => {
      const concurrentRequests = 20
      const requestData = {
        deviceType: "laptop",
        problemDescription: "Performance test request",
        scheduledDate: "2024-12-31",
        status: "pending",
      }

      const startTime = Date.now()

      // Create array of concurrent requests
      const requests = Array(concurrentRequests)
        .fill()
        .map((_, index) =>
          request(app)
            .post("/request/create")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
              ...requestData,
              problemDescription: `Performance test request ${index + 1}`,
            }),
        )

      const responses = await Promise.all(requests)

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(201)
        expect(response.body.newSupportRequest.problemDescription).toBe(`Performance test request ${index + 1}`)
      })

      // Performance assertion
      expect(totalTime).toBeLessThan(10000) // 10 seconds for 20 concurrent requests

      console.log(`✅ ${concurrentRequests} concurrent support requests completed in ${totalTime}ms`)
    })
  })

  describe("Memory Usage Tests", () => {
    it("should handle large payload without memory issues", async () => {
      const largeDescription = "A".repeat(10000) // 10KB description

      const requestData = {
        deviceType: "laptop",
        problemDescription: largeDescription,
        scheduledDate: "2024-12-31",
        status: "pending",
      }

      const response = await request(app)
        .post("/request/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send(requestData)

      expect(response.status).toBe(201)
      expect(response.body.newSupportRequest.problemDescription).toBe(largeDescription)

      console.log("✅ Large payload handled successfully")
    })

    it("should handle multiple large requests sequentially", async () => {
      const numberOfRequests = 50
      const largeDescription = "B".repeat(5000) // 5KB each

      for (let i = 0; i < numberOfRequests; i++) {
        const requestData = {
          deviceType: "laptop",
          problemDescription: `${largeDescription} - Request ${i + 1}`,
          scheduledDate: "2024-12-31",
          status: "pending",
        }

        const response = await request(app)
          .post("/request/create")
          .set("Authorization", `Bearer ${userToken}`)
          .send(requestData)

        expect(response.status).toBe(201)
      }

      console.log(`✅ ${numberOfRequests} large sequential requests completed`)
    })
  })

  describe("Response Time Tests", () => {
    it("should respond to authentication requests quickly", async () => {
      await dbHelpers.createTestUser()

      const startTime = Date.now()

      const response = await request(app).post("/auth/login").send({
        email: testData.user.valid.email,
        password: testData.user.valid.password,
      })

      const responseTime = Date.now() - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second

      console.log(`✅ Authentication response time: ${responseTime}ms`)
    })

    it("should respond to data retrieval requests quickly", async () => {
      // Create some test data
      const requests = Array(10)
        .fill()
        .map((_, index) => ({
          id: `req-${index}`,
          userId: testData.user.valid.id,
          deviceType: "laptop",
          problemDescription: `Test request ${index + 1}`,
          scheduledDate: new Date("2024-12-31"),
          status: "pending",
        }))

      await dbHelpers.createMultipleRecords(require("../../models/model").SupportRequestModel, requests)

      const startTime = Date.now()

      const response = await request(app).get("/request/my-requests").set("Authorization", `Bearer ${userToken}`)

      const responseTime = Date.now() - startTime

      expect(response.status).toBe(200)
      expect(response.body.requests).toHaveLength(10)
      expect(responseTime).toBeLessThan(2000) // Should respond within 2 seconds

      console.log(`✅ Data retrieval response time: ${responseTime}ms`)
    })
  })

  describe("Stress Tests", () => {
    it("should handle rapid sequential requests", async () => {
      const numberOfRequests = 100
      const results = []

      for (let i = 0; i < numberOfRequests; i++) {
        const startTime = Date.now()

        const response = await request(app)
          .post("/request/create")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            deviceType: "laptop",
            problemDescription: `Stress test request ${i + 1}`,
            scheduledDate: "2024-12-31",
            status: "pending",
          })

        const responseTime = Date.now() - startTime
        results.push({ index: i, status: response.status, responseTime })

        expect(response.status).toBe(201)
      }

      const averageResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0) / numberOfRequests

      const maxResponseTime = Math.max(...results.map((r) => r.responseTime))
      const minResponseTime = Math.min(...results.map((r) => r.responseTime))

      console.log(`✅ Stress test completed:`)
      console.log(`   - Requests: ${numberOfRequests}`)
      console.log(`   - Average response time: ${averageResponseTime.toFixed(2)}ms`)
      console.log(`   - Min response time: ${minResponseTime}ms`)
      console.log(`   - Max response time: ${maxResponseTime}ms`)

      // Performance assertions
      expect(averageResponseTime).toBeLessThan(500) // Average should be under 500ms
      expect(maxResponseTime).toBeLessThan(2000) // No single request should take more than 2s
    })
  })
})
