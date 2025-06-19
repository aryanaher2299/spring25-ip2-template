import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Chat collection.
 *
 * - `participants`: an array of ObjectIds referencing the User collection.
 * - `messages`: an array of ObjectIds referencing the Message collection.
 * - Timestamps store `createdAt` & `updatedAt`.
 */
// TODO: Task 3 - Define the schema for the Chat
const chatSchema = new Schema(
  {
    participants: [{ type: 'ObjectId', ref: 'User', required: true }],
    messages: [{ type: 'ObjectId', ref: 'Message' }],
  },
  { timestamps: true },
);

export default chatSchema;
