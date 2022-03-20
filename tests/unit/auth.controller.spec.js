const bcrypt = require('bcrypt');
const { createMockContext } = require('@shopify/jest-koa-mocks');
const { signIn, signUp } = require('../../src/controllers/auth.controller');
const userModel = require('../../src/models/user.model');
const user = require('../mock-data/user.json');

jest.mock('bcrypt');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('When try to register new user with valid data and username that does not exist, should return statusCode 201', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue({});

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });
      //Act
      await signUp(ctx);
      //Assert
      expect(ctx.status).toBe(201);
    });

    it('When try to register new user with valid data but the username is already exists, should throw error with statusCode 422', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signUp(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/ya existe/);
        expect(error.status).toBe(422);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('signin', () => {
    it('When try to signin with valid credentials, should return statusCode 200 and a new token', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });
      //Act
      await signIn(ctx);
      //Assert
      expect(ctx.status).toBe(200);
      expect(ctx.body).toHaveProperty('access_token');
      expect(ctx.body).toHaveProperty('token_expires');
    });

    it('When try to signin with wrong username, should return statusCode 401 (Unauthorized)', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signIn(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/Usuario o password incorectos/);
        expect(error.status).toBe(401);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When try to signin with valid username but wrong password, should return statusCode 401 (Unauthorized)', async () => {
      //Arrange
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const ctx = createMockContext({
        method: 'POST',
        requestBody: user,
      });

      try {
        //Act
        await signIn(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/Usuario o password incorectos/);
        expect(error.status).toBe(401);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});