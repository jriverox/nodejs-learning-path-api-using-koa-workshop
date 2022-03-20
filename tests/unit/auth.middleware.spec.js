const { createMockContext } = require('@shopify/jest-koa-mocks');
const { verifyToken } = require('../../src/middleware/auth');
const { validToken, wrongToken, expiredToken } = require('../mock-data/token.json');

describe('Token Verification', () => {
  beforeEach(() => {});

  it('When pass a valid token, should not thrown error', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = validToken;

    //Act
    verifyToken(ctx, () => ({}));
    //Assert
    expect(ctx.request.user).not.toBeNull();
  });

  it('When pass an invalid token, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = wrongToken;

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Arrange
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/Invalid Token/);
      expect(error.isOperational).toBeTruthy();
    }
  });

  it('When pass an expired token, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });
    ctx.headers['x-access-token'] = expiredToken;

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Assert
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/Invalid Token/);
      expect(error.isOperational).toBeTruthy();
    }
  });

  it('When do not pass the x-access-token header, should thrown UnauthorizedError', () => {
    //Arrange
    const ctx = createMockContext({
      method: 'POST',
    });

    try {
      //Act
      verifyToken(ctx, () => ({}));
    } catch (error) {
      //Assert
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/A token is required for authentication/);
      expect(error.isOperational).toBeTruthy();
    }
  });
});