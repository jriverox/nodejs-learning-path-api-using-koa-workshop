const request = require('supertest');
const contactModel = require('../../src/models/contact.model');
const app = require('../../src/app');
const contactMockData = require('../mock-data/contact.json');
const {
  contactInvalidEmail,
  contactMissingNames,
  contactInvalidDateOfBirth,
} = require('../mock-data/contacts-invalid-cases.json');
const { validToken, wrongToken } = require('../mock-data/token.json');

describe('Contacts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });

  describe('GET contact by index', () => {
    it('When pass an index of existing contact and valid token, should return the success and statusCode 200', async () => {
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const agent = request(app.callback());
      const response = await agent
        .get(`/contacts/${contact.index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(contact);
      expect(contactModel.findOne).toBeCalled();
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When pass an index of a contact that does not exist and valid token, should return the statusCode 404', async () => {
      const index = 25000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
      expect(contactModel.findOne).toHaveBeenCalledWith({ index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When pass an invalid index and valid token, should return the statusCode 422', async () => {
      const index = 'xxxxxxx';

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({});
    });

    it('When pass a valid index but a invalid token, should return the statusCode 401', async () => {
      const index = 1000;
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const agent = request(app.callback());

      const response = await agent
        .get(`/contacts/${contact.index}`)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  });

  // ACTUALIZACION DE CONTACTOS
  describe('Update Contact', () => {
    it('When pass correct data of a contact that exists and a valid token, should return statusCode 200', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contactFound);
      contactModel.updateOne = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(body);
      expect(contactModel.findOne).toHaveBeenCalledWith({ index: contactFound.index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
      expect(contactModel.updateOne.mock.calls.length).toBe(1);
    });

    it('When try to update of a contact that does not exist and pass a valid token, should return statusCode 404', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(404);
      expect(contactModel.findOne).toHaveBeenCalledWith({ index: contactFound.index });
      expect(contactModel.findOne.mock.calls.length).toBe(1);
    });

    it('When try to update of a contact with incorrect data and pass a valid token, should return statusCode 422', async () => {
      const index = 1000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const agent = request(app.callback());

      const invalidBodies = [contactInvalidEmail, contactMissingNames, contactInvalidDateOfBirth];

      for (const invalidBody of invalidBodies) {
        const response = await agent
          .put(`/contacts/${index}`)
          .send(invalidBody)
          .set('Accept', 'application/json')
          .set('x-access-token', validToken);

        expect(response.status).toBe(422);
      }
      expect(contactModel.findOne).not.toHaveBeenCalled();
    });

    it('When try to update but pass wrong token, should return statusCode 401', async () => {
      const body = { ...contactMockData };
      const contactFound = {
        index: 1000,
        ...contactMockData,
      };
      //contactModel.findOne = jest.fn().mockResolvedValue(contactFound);
      //contactModel.updateOne = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .put(`/contacts/${contactFound.index}`)
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(contactModel.findOne).not.toHaveBeenCalled();
    });
  });

  //CREACION DE CONTACTOS
  describe('Create Contact', () => {
    it('When try to create a contact with correct data and a valid token, should return statusCode 201', async () => {
      const body = { ...contactMockData };
      const lastIndex = 1000;
      contactModel.findOne = jest.fn().mockResolvedValue({ index: lastIndex });
      contactModel.create = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const response = await agent
        .post('/contacts/')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', validToken);

      expect(response.status).toBe(201);
      expect(response.body.index).toBeGreaterThan(lastIndex);
      expect(contactModel.create.mock.calls.length).toBe(1);
    });

    it('When try to create new contact with incorrect data and pass a valid token, should return statusCode 422', async () => {
      const index = 1000;

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      contactModel.create = jest.fn().mockResolvedValue({});
      const agent = request(app.callback());

      const invalidBodies = [contactInvalidEmail, contactMissingNames, contactInvalidDateOfBirth];

      for (const invalidBody of invalidBodies) {
        const response = await agent
          .post('/contacts')
          .send(invalidBody)
          .set('Accept', 'application/json')
          .set('x-access-token', validToken);

        expect(response.status).toBe(422);
      }
      expect(contactModel.findOne).not.toHaveBeenCalled();
      expect(contactModel.create).not.toHaveBeenCalled();
    });

    it('When try to create but pass wrong token, should return statusCode 401', async () => {
      const body = { ...contactMockData };

      contactModel.findOne = jest.fn().mockResolvedValue(null);
      contactModel.create = jest.fn().mockResolvedValue({});

      const agent = request(app.callback());

      const response = await agent
        .post('/contacts/')
        .send(body)
        .set('Accept', 'application/json')
        .set('x-access-token', wrongToken);

      expect(response.status).toBe(401);
      expect(contactModel.findOne).not.toHaveBeenCalled();
      expect(contactModel.create).not.toHaveBeenCalled();
    });
  });
});
