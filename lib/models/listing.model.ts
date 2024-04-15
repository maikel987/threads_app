import mongoose from "mongoose";
import { ListingStatus } from "./listingstatus";

const listingSchema = new mongoose.Schema({
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
      enum: ListingStatus,
    },
    listing_features: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ListingFeatures",
      required: false,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: false,
    },
    conversation_ID_archives: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConversationIdArchive",
    }],
    picture: {
      type: String,
      required: false,
    },
    platform_account: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"PlatformAccount", // creer platform_account
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

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
export default Listing;