import mongoose, { Document } from "mongoose";

export interface IListingFeatures extends Document {
  guest?: number;
  bedroom?: number;
  bed?: number;
  bathroom?: number; 
  checkin?: string;
  checkout?: string;
  sleeping: string[];
  description: string[];
  amenities: string[];
  rules: string[];
  safety: string[];
  listing: mongoose.Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

const listingFeaturesSchema = new mongoose.Schema<IListingFeatures>({
  guest: {
    type: Number,
    required: false,
  },
  bedroom: {
    type: Number,
    required: false,
  },
  bed: {
    type: Number,
    required: false,
  },
  bathroom: {
    type: Number,
    required: false,
  },
  checkin: { 
    type: String,
    required: false,
  },
  checkout: { 
    type: String,
    required: false,
  },
  sleeping: [ 
    {
      type: String,
    },
  ],
  description: [ 
    {
      type: String,
    },
  ],
  amenities: [ 
    {
      type: String,
    },
  ],
  rules: [ 
    {
      type: String,
    },
  ],
  safety: [ 
    {
      type: String,
    },
  ],
  listing: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
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

const ListingFeatures = mongoose.models.ListingFeatures || mongoose.model<IListingFeatures>("ListingFeatures", listingFeaturesSchema);

export default ListingFeatures;
