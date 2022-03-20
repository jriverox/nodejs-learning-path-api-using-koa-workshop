const { createMockContext } = require('@shopify/jest-koa-mocks');
const {
  getContactByIndex,
  createContact,
  updateContact,
} = require('../../src/controllers/contacts.controller');
const contactModel = require('../../src/models/contact.model');
const contactMockData = require('../mock-data/contact.json');

describe('Contacts Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Contact by Index', () => {
    it('When pass an index of existing contact, should return statusCode 200', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      //Act
      await getContactByIndex(ctx);

      //Assert
      expect(ctx.status).toBe(200);
      expect(ctx.body).toBe(contact);
    });

    it('When pass an index of contact that does not exist, should return statusCode 404', async () => {
      //Arrange
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      try {
        //Act
        await getContactByIndex(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/No se ha encontrado/);
        expect(error.status).toBe(404);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('Create Contact', () => {
    it('When try to create a contact with correct data, should return statusCode 201', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      contactModel.create = jest.fn().mockResolvedValue({});
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactMockData,
      });

      //Act
      await createContact(ctx);

      //Assert
      expect(ctx.status).toBe(201);
      expect(ctx.body.index).toBeGreaterThan(contact.index);
    });
  });

  describe('Update Contact', () => {
    it('When try update a contact with correct data, should return statusCode 200', async () => {
      //Arrange
      const contact = {
        index: 1000,
        ...contactMockData,
      };
      contactModel.findOne = jest.fn().mockResolvedValue(contact);
      contactModel.updateOne = jest.fn().mockResolvedValue({});
      const ctx = createMockContext({
        method: 'PUT',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });

      //Act
      await updateContact(ctx);

      //Assert
      expect(ctx.status).toBe(200);
    });

    it('When try update a contact with correct data but does not exist, should return statusCode 404', async () => {
      //Arrange
      contactModel.findOne = jest.fn().mockResolvedValue(null);
      const ctx = createMockContext({
        method: 'PUT',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });

      try {
        //Act
        await updateContact(ctx);
      } catch (error) {
        //Assert
        expect(error.message).toMatch(/No se ha encontrado/);
        expect(error.status).toBe(404);
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});