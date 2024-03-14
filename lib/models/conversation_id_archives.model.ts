import mongoose from 'mongoose';
const { Schema } = mongoose;

// Le nom est ajusté pour être plus conventionnel et clair
const conversationIdArchiveSchema = new Schema({
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

const ConversationIdArchive = mongoose.models.ConversationIdArchive || mongoose.model('ConversationIdArchive', conversationIdArchiveSchema, 'conversation_id_archives');

export default ConversationIdArchive;
