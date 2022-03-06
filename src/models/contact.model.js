/**
 * contact.model.js
 * Nos permite gestionar los datos de la colección contacts de MongoDB
 */
 const mongoose = require('mongoose');

 const { Schema, model } = mongoose;
 
 const contactSchema = new Schema(
   {
     index: {
       type: Number,
       required: true,
     },
     dateOfBirth: {
       type: String,
       required: false,
     },
     firstName: {
       type: String,
       required: true,
     },
     lastName: {
       type: String,
       required: true,
     },
     username: {
       type: String,
       required: true,
     },
     company: {
       type: String,
       required: true,
     },
     email: {
       type: String,
       required: false,
     },
     phone: {
       type: String,
       required: false,
     },
     address: {
       street: {
         type: String,
         required: true,
       },
       city: {
         type: String,
         required: true,
       },
       state: {
         type: String,
         required: true,
       },
     },
     jobPosition: {
       type: String,
       required: false,
     },
     roles: [String],
     active: {
       type: Boolean,
       default: true,
     },
   },
   {
     collection: 'contacts',
   },
 );
 
 const contactModel = model('ContactModel', contactSchema);
 module.exports = contactModel;
 