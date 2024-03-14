import mongoose from 'mongoose';
const { Schema } = mongoose;

const platformAccountSchema = new Schema({
  _id: Schema.Types.ObjectId,
  listings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing', // Remplacez 'Listing' par le nom exact du modèle référencé si différent
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Remplacez 'User' par le nom exact du modèle référencé si différent
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  platform: {
    type: String,
    required: false,
  },
  platform_account_id: {
    type: String,
    required: true,
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

const PlatformAccount = mongoose.models.PlatformAccount || mongoose.model('PlatformAccount', platformAccountSchema);

export default PlatformAccount;
