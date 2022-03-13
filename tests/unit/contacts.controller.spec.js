const { createMockContext } = require('@shopify/jest-koa-mocks');
const { getContactByIndex, createContact, updateContact } = require('../../src/controllers/contacts.controller');
const contactModel = require('../../src/models/contact.model');
const AppError = require('../../src/utils/logging/app-error');
const commonErrors = require('../../src/utils/logging/common-errors');

let ctx = {};

jest.mock('../../src/models/contact.model');

describe('API / Contacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /contact/:index', () => {
    it('When pass an index of existing contact, should return the data successfully', async () => {
      const contact = {
        index: 1000,
        dateOfBirth: "1908-01-01",
        firstName: "Pepe",
        lastName: "Trueno",
        username: "pepetrueno",
        company: "Acme",
        email: "pepetrueno@acme.com",
        phone: "+1 234 456 567",
        address: {
          street: "calle ugreen 234",
          city: "Miami",
          state: "Florida"
        },
        jobPosition: "CEO",
        roles: ["guest", "admin"],
        active: true
      };

      contactModel.findOne.mockResolvedValue(contact);
      const filter = { index:1000 };

      ctx = createMockContext({
        method: 'GET',
        customProperties: { params: filter },
        state: contact,
      });

      await getContactByIndex(ctx);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual(contact);
      expect(contactModel.findOne).toBeCalledWith(filter);

    });

    it('When pass an index of a contact that does not exist, should return 404 not found error', async () => {
      contactModel.findOne.mockResolvedValue(null);
      const filter = { index: 1001 };

      ctx = createMockContext({
        method: 'GET',
        statusCode: 404,
        customProperties: { params: filter },
        state: null,
      });

      await expect(getContactByIndex(ctx)).rejects.toThrowError(/No se ha encontrado/);
      expect(ctx.status).toBe(commonErrors.NotFound.httpStatus);
      expect(contactModel.findOne).toBeCalledWith(filter);

      try {
        await getContactByIndex(ctx);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.isOperational).toBeTruthy();
        expect(error.status).toBe(commonErrors.NotFound.httpStatus);
      }
    });
  });

  describe('PUT /contacts/:index', () => {
    it('When pass correct data of a contact that exists, should update successfully', async () => {
      const contact = {
        dateOfBirth: "1908-01-01",
        firstName: "Pepe",
        lastName: "Trueno",
        username: "pepetrueno",
        company: "Acme",
        email: "pepetrueno@acme.com",
        phone: "+1 234 456 567",
        address: {
          street: "calle ugreen 234",
          city: "Miami",
          state: "Florida"
        },
        jobPosition: "CEO",
        roles: ["guest", "admin"],
        active: true
      };

      const filter = { index: 1000 };
      contactModel.findOne.mockResolvedValue(filter);
      contactModel.updateOne.mockResolvedValue(filter);

      ctx = createMockContext({
        method: 'PUT',
        customProperties: { params: filter, body: contact },
        state: contact,
      });

      await updateContact(ctx);

      expect(ctx.status).toBe(200);
      expect(contactModel.updateOne).toBeCalled();
      expect(contactModel.findOne).toBeCalled();

    });

    it('When pass correct data of a contact that doesn not exist, should return 404', async () => {

      contactModel.findOne.mockResolvedValue(null);
      const filter = { index: 1001 };

      ctx = createMockContext({
        method: 'GET',
        statusCode: 404,
        customProperties: { params: filter },
        state: null,
      });

      await expect(updateContact(ctx)).rejects.toThrowError(/No se ha encontrado/);
      expect(contactModel.findOne).toBeCalled();
      expect(ctx.status).toBe(commonErrors.NotFound.httpStatus);

      try {
        await updateContact(ctx);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.isOperational).toBeTruthy();
        expect(error.status).toBe(commonErrors.NotFound.httpStatus);
      }
    });
  });

  describe('POST /contacts', () => {
    it('When pass correct data of a contact that doesnt exist, should create successfully', async () => {
      const contact = {
        dateOfBirth: "1908-01-01",
        firstName: "Pepe",
        lastName: "Trueno",
        username: "pepetrueno",
        company: "Acme",
        email: "pepetrueno@acme.com",
        phone: "+1 234 456 567",
        address: {
          street: "calle ugreen 234",
          city: "Miami",
          state: "Florida"
        },
        jobPosition: "CEO",
        roles: ["guest", "admin"],
        active: true
      };

      contactModel.findOne.mockResolvedValue({index: 1000});
      contactModel.create.mockResolvedValue(contact);

      ctx = createMockContext({
        method: 'POST',
        customProperties: { body: contact },
        state: {...contact, index: 1000},
      });

      await createContact(ctx);

      expect(ctx.status).toBe(201);
      expect(contactModel.create).toBeCalled();
      expect(contactModel.findOne).toBeCalled();

    });

    // it('When pass correct data of a contact that doesn not exist, should return 404', async () => {

    //   contactModel.findOne.mockResolvedValue(null);
    //   const filter = { index: 1001 };

    //   ctx = createMockContext({
    //     method: 'GET',
    //     statusCode: 404,
    //     customProperties: { params: filter },
    //     state: null,
    //   });

    //   await expect(updateContact(ctx)).rejects.toThrowError(/No se ha encontrado/);
    //   expect(contactModel.findOne).toBeCalled();
    //   expect(ctx.status).toBe(commonErrors.NotFound.httpStatus);

    //   try {
    //     await updateContact(ctx);
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(AppError);
    //     expect(error.isOperational).toBeTruthy();
    //     expect(error.status).toBe(commonErrors.NotFound.httpStatus);
    //   }
    // });
  });
});