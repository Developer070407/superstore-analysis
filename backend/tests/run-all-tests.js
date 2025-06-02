const { spawn } = require("child_process")

function runTests() {
  console.log("🚀 Starting comprehensive test suite...\n")

  const jest = spawn("npx", ["jest", "--verbose", "--coverage"], {
    stdio: "inherit",
    shell: true,
  })

  jest.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ All tests completed successfully!")
    } else {
      console.log(`\n❌ Tests failed with exit code ${code}`)
      process.exit(code)
    }
  })

  jest.on("error", (error) => {
    console.error("❌ Failed to start test runner:", error)
    process.exit(1)
  })
}

runTests()
