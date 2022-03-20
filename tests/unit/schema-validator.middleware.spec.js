const { createMockContext } = require('@shopify/jest-koa-mocks');
const contactMockData = require('../mock-data/contact.json');
const {
  contactInvalidEmail,
  contactMissingNames,
  contactInvalidDateOfBirth,
} = require('../mock-data/contacts-invalid-cases.json');
const validateSchema = require('../../src/middleware/schema-validator');

const { byIndexSchema, postSchema } = require('../../src/schemas/contacts.schema');
const byIndexValidator = validateSchema({ params: byIndexSchema });
const postValidator = validateSchema({ body: postSchema });

describe('Contact Schema Validator', () => {
  describe('Post Schema', () => {
    it('When pass a correct json, should execute next function successfully', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        customProperties: { params: { index: 1000 } },
        requestBody: contactMockData,
      });

      const next = () => {};

      //Act
      const result = postValidator(ctx, () => next);

      //Assert
      expect(typeof result).toBe('function');
    });

    it('When pass an empty body, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: {},
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toMatch(/Solicitud no válida/);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but without a valid email, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactInvalidEmail,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toMatch(/Solicitud no válida/);
        expect(error.message).toMatch(/must be a valid email/);
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but without a first and last name, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactMissingNames,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid Request Body - "firstName" is required',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });

    it('When pass correct contact in the body but with invalid birth day, should thrown InvalidInputError', () => {
      //Arrange
      const ctx = createMockContext({
        method: 'POST',
        requestBody: contactInvalidDateOfBirth,
      });

      try {
        //Act
        postValidator(ctx, () => () => {});
      } catch (error) {
        //Assert
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid Request Body - "dateOfBirth" must be in ISO 8601 date format',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });
  });

  describe('Get By Index Schema', () => {
    it('When pass a number as parameter, should execute next function successfully', () => {
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 1000 } },
      });

      const next = () => {};
      const result = byIndexValidator(ctx, () => next);

      expect(typeof result).toBe('function');
    });

    it('When pass a parameter that not be a number, should thrown InvalidInputError', () => {
      const ctx = createMockContext({
        method: 'GET',
        customProperties: { params: { index: 'xxxxxx' } },
      });

      try {
        byIndexValidator(ctx, () => () => {});
      } catch (error) {
        expect(error.status).toBe(422);
        expect(error.message).toEqual(
          'Solicitud no válida: Invalid URL Parameters - "index" must be a number',
        );
        expect(error.isOperational).toBeTruthy();
      }
    });
  });
});