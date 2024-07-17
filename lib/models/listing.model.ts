"use server";
import mongoose, { Document } from "mongoose";
import { ListingStatus } from "./listingstatus"; // Make sure this is correctly imported
import { IPlatformAccount } from "./platform_account.model";
import { IReservation } from "./reservation.modelt";
import { IApartment } from "./apartment.model";
import { IListingFeatures } from "./listing_features.model";

export interface IListing extends Document {
  internal_id?: string;
  link?: string;
  platform?: string;
  status: ListingStatus; 
  listing_features?: mongoose.Types.ObjectId|IListingFeatures;
  apartment?: mongoose.Types.ObjectId|IApartment;
  reservations: mongoose.Types.ObjectId[]|IReservation[];
  picture?: string;
  platform_account?: mongoose.Types.ObjectId|IPlatformAccount;
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
    enum: Object.values(ListingStatus), 
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
  reservations: [{
    type: Schema.Types.ObjectId,
    ref: "Reservation",
  }],
  picture: {
    type: String,
    required: false,
  },
  platform_account: {
    type: Schema.Types.ObjectId,
    ref: "PlatformAccount", 
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
