import mongoose, { Document } from "mongoose";

// Définition de l'interface pour un document Apartment
export interface IApartment extends Document {
  internal_name?: string;
  checkin_process?: string;
  address?: string;
  urgent_number?: string;
  owner: mongoose.Types.ObjectId;
  listingFeatures?: mongoose.Types.ObjectId;
  listings: mongoose.Types.ObjectId[];
  coordinates?: {
    latitude?: string;
    longitude?: string;
  };
  created_at?: Date;
  updated_at?: Date;
}

// Définition du schéma Mongoose en utilisant l'interface IApartment
const apartmentSchema = new mongoose.Schema<IApartment>({
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
    alias: "listing_features",
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
  coordinates: {
    type: {
      latitude: {
        type: String,
        required: false,
      },
      longitude: {
        type: String,
        required: false,
      }
    },
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

// Création du modèle Mongoose avec l'interface IApartment
const Apartment = mongoose.models.Apartment || mongoose.model<IApartment>("Apartment", apartmentSchema);

export default Apartment;
