# Test Suite Documentation

This directory contains comprehensive test suites for the backend application covering controllers, services, models, middleware, and utilities.

## Test Structure

### Controller Tests
- `authenticationController.test.js` - Tests for user registration, login, and token refresh
- `supportRequestController.test.js` - Tests for CRUD operations on support requests
- `knowledgeBaseController.test.js` - Tests for knowledge base management
- `sparePartsController.test.js` - Tests for spare parts inventory management
- `jobSchedulingController.test.js` - Tests for job scheduling operations
- `technicianController.test.js` - Tests for technician management
- `userController.test.js` - Tests for user management operations

### Service Tests
- `authenticationService.test.js` - Tests for authentication business logic
- `supportRequestService.test.js` - Tests for support request service layer
- `knowledgeBaseService.test.js` - Tests for knowledge base service operations
- `sparePartsService.test.js` - Tests for spare parts service logic
- `jobSchedulingService.test.js` - Tests for job scheduling service
- `technicianService.test.js` - Tests for technician service operations
- `userService.test.js` - Tests for user service operations

### Model Tests
- `model.test.js` - Tests for all database models and validation schemas

### Middleware Tests
- `auth.test.js` - Tests for authentication middleware

### Utilities
- `testHelpers.js` - Common test utilities and mock data
- `setup.js` - Test database setup and teardown functions

## Running Tests

### Run All Tests
\`\`\`bash
npm test
\`\`\`

### Run Specific Test File
\`\`\`bash
npm test -- authenticationController.test.js
\`\`\`

### Run Tests with Coverage
\`\`\`bash
npm run test:coverage
\`\`\`

### Run Tests in Watch Mode
\`\`\`bash
npm run test:watch
\`\`\`

## Test Features

### Mocking
- All external dependencies are properly mocked
- Database operations use in-memory MongoDB
- JWT and bcrypt operations are mocked for speed

### Coverage
- Comprehensive test coverage for all endpoints
- Edge cases and error scenarios included
- Input validation testing

### Authentication Testing
- Valid and invalid token scenarios
- Role-based access control testing
- Password validation and hashing

### Database Testing
- Model validation testing
- CRUD operation testing
- Relationship testing

### Error Handling
- Service layer error testing
- Controller error response testing
- Middleware error handling

## Test Data

The test suite includes comprehensive test data for:
- Valid and invalid user data
- Support request scenarios
- Knowledge base articles
- Spare parts inventory
- Job scheduling data
- Technician information

## Best Practices

1. **Isolation**: Each test is isolated and doesn't depend on others
2. **Cleanup**: Database is cleared between tests
3. **Mocking**: External dependencies are mocked appropriately
4. **Coverage**: All code paths are tested
5. **Error Cases**: Both success and failure scenarios are covered
6. **Documentation**: Tests serve as living documentation

## Configuration

Tests use Jest as the testing framework with the following configuration:
- In-memory MongoDB for database testing
- Supertest for HTTP endpoint testing
- Jest mocks for external dependencies
- Coverage reporting enabled

## Continuous Integration

These tests are designed to run in CI/CD pipelines and provide:
- Fast execution through mocking
- Reliable results through proper isolation
- Comprehensive coverage reporting
- Clear failure reporting
