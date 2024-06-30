import mongoose, { Document } from 'mongoose';

interface IConversationIdArchive extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  status: string;
  summary?: string;  // Optional since it has a default value and may not be required on creation
  created_at?: Date;
  updated_at?: Date;
}

const { Schema } = mongoose;

const conversationIdArchiveSchema = new Schema<IConversationIdArchive>({
  _id: Schema.Types.ObjectId,

  id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const ConversationIdArchive = mongoose.models.ConversationIdArchive || mongoose.model<IConversationIdArchive>('ConversationIdArchive', conversationIdArchiveSchema, 'conversation_id_archives');

export default ConversationIdArchive;
