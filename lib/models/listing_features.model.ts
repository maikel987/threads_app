import mongoose from "mongoose";

const listingFeaturesSchema = new mongoose.Schema({
  features: { 
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

//const ListingFeatures = mongoose.models.listingFeatures || mongoose.model("listing_features", listingFeaturesSchema);
const ListingFeatures = mongoose.models.ListingFeatures || mongoose.model("ListingFeatures", listingFeaturesSchema);

export default ListingFeatures;
