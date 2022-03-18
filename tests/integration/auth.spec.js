const request = require('supertest');
const bcrypt = require('bcrypt');
const userModel = require('../../src/models/user.model');
const app = require('../../src/app');
const user = require('../mock-data/user.json');

jest.mock('bcrypt');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });
  //REGISTRO DE USUARIO
  describe('signup', () => {
    it('When try to register new user with valid data and username that does not exist, should return statusCode 201', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signup')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(userModel.findOne).toHaveBeenCalled();
      expect(userModel.create).toHaveBeenCalled();
    });

    it('When try to register new user with valid data but the username is already exists, should return statusCode 422', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      userModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signup')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(422);
      expect(userModel.findOne).toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });

  //AUTENCICACION Y GENERACION DE TOKEN
  describe('signin', () => {
    it('When try to signin with valid credentials, should return statusCode 200 and a new token', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_expires');
      expect(response.body.access_token.length).toBeGreaterThan(0);
      expect(response.body.token_expires.length).toBeGreaterThan(0);
      expect(userModel.findOne).toHaveBeenCalled();
    });

    it('When try to signin with wrong username, should return statusCode 401 (Unauthorized)', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      //bcrypt.compare = jest.fn().mockResolvedValue(true);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });

    it('When try to signin with valid username but wrong password, should return statusCode 401 (Unauthorized)', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      const agent = request(app.callback());

      const response = await agent
        .post('/auth/signin')
        .send(user)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });
  });
});
