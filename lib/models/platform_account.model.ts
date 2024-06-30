import mongoose, { Document } from 'mongoose';
import { IntegrationStatus } from './integrationStatus'; // Ensure this import is correct

interface IPlatformAccount extends Document {
  listings: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  username?: string;
  password?: string;
  status: IntegrationStatus; // Assuming IntegrationStatus is an enum
  platform?: string;
  apiKey?: string;
  platform_account_id?: string;
  account_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

const { Schema } = mongoose;

const platformAccountSchema = new Schema<IPlatformAccount>({
  listings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing',
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(IntegrationStatus), // Ensure IntegrationStatus is an enum and correctly imported
  },
  platform: {
    type: String,
    required: false,
  },
  apiKey: {
    type: String,
    required: false,
  },
  platform_account_id: {
    type: String,
    required: false,
  },  
  account_url: {
    type: String,
    required: false,
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

const PlatformAccount = mongoose.models.PlatformAccount || mongoose.model<IPlatformAccount>('PlatformAccount', platformAccountSchema);
export default PlatformAccount;
