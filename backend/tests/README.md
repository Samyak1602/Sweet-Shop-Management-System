# Authentication Test Suite

This directory contains comprehensive test cases for the authentication system.

## Test Files

### `auth.test.js`
Tests for user authentication endpoints including registration and login.

## Test Coverage

### Registration Tests (`POST /api/auth/register`)
- ✅ Register user successfully
- ✅ Fail registration if email already exists
- ✅ Fail registration if password is weak
- ✅ Fail registration if required fields are missing
- ✅ Fail registration with invalid email format

### Login Tests (`POST /api/auth/login`)
- ✅ Login successfully with correct credentials
- ✅ Return JWT token on successful login
- ✅ Fail login with incorrect password
- ✅ Fail login with non-existent email
- ✅ Fail login if required fields are missing
- ✅ Fail login with invalid email format

### JWT Token Tests
- ✅ JWT token is returned on login
- ✅ Token includes user ID in payload
- ✅ Token has proper expiration set

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run specific test file:
```bash
npm test auth.test.js
```

## Test Database

Tests use a separate test database (`sweet-shop-test`) to avoid affecting development data.

The database is:
- Created before tests run
- Cleared after each test
- Dropped after all tests complete

## Expected Responses

### Successful Registration (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Successful Login (200)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Failed Authentication (400/401)
```json
{
  "success": false,
  "message": "Error description"
}
```

## Notes

- Controllers are not implemented yet - tests will fail until implementation
- Password validation requires minimum 8 characters with letters and numbers
- Email must be in valid format
- JWT tokens should expire according to JWT_EXPIRE env variable
