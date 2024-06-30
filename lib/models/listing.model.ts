import mongoose, { Document } from "mongoose";
import { ListingStatus } from "./listingstatus"; // Make sure this is correctly imported

export interface IListing extends Document {
  internal_id?: string;
  link?: string;
  platform?: string;
  status: ListingStatus; // Using enum type from the import
  listing_features?: mongoose.Types.ObjectId;
  apartment?: mongoose.Types.ObjectId;
  conversation_ID_archives: mongoose.Types.ObjectId[];
  picture?: string;
  platform_account?: mongoose.Types.ObjectId;
  title?: string;
  created_at?: Date;
  updated_at?: Date;
}

const { Schema } = mongoose;

const listingSchema = new Schema<IListing>({
  internal_id: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: false,
  },
  platform: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(ListingStatus), // Assuming ListingStatus is an enum or object
  },
  listing_features: {
    type: Schema.Types.ObjectId,
    ref: "ListingFeatures",
    required: false,
  },
  apartment: {
    type: Schema.Types.ObjectId,
    ref: "Apartment",
    required: false,
  },
  conversation_ID_archives: [{
    type: Schema.Types.ObjectId,
    ref: "ConversationIdArchive",
  }],
  picture: {
    type: String,
    required: false,
  },
  platform_account: {
    type: Schema.Types.ObjectId,
    ref: "PlatformAccount", // Ensure "PlatformAccount" schema is defined somewhere
    required: false,
  },
  title: {
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

const Listing = mongoose.models.Listing || mongoose.model<IListing>("Listing", listingSchema);
export default Listing;
