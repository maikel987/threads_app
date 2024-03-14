import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Utilisation automatique de l'identifiant généré par MongoDB
  internal_id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  bio: String,
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
  apartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Apartment",
  }],
  platform_account: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlatformAccount",
  }],
  created_at: {
    type: Date,
    default: Date.now,
  },  
  updated_at: {
    type: Date,
    default: Date.now,
  },
});



const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
