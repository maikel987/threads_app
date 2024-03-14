import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
  internal_name: { 
    type: String,
    unique: false,
    required: false,
  },
  checkin_process: {
    type: String,
    unique: false,
    required: false,
  },  
  address: {
    type: String,
    unique: false,
    required: false,
  },  
  urgent_number: {
    type: String,
    unique: false,
    required: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },  
  listingFeatures: {
    alias:"listing_features",
    type: mongoose.Schema.Types.ObjectId,
    ref: "listing_features",
    required: false,
  },
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },  
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Apartment = mongoose.models.Apartment || mongoose.model("Apartment", apartmentSchema);

export default Apartment;
