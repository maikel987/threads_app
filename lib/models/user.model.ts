import mongoose, { Document } from "mongoose";

interface IUser extends Document {
  internal_id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  threads: mongoose.Types.ObjectId[];
  onboarded?: boolean;
  communities: mongoose.Types.ObjectId[];
  apartments: mongoose.Types.ObjectId[];
  platform_account: mongoose.Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

const { Schema } = mongoose;

const userSchema = new Schema<IUser>({
  _id: { type: Schema.Types.ObjectId, auto: true }, // MongoDB automatically generates and assigns the _id
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
      type: Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
  apartments: [{
    type: Schema.Types.ObjectId,
    ref: "Apartment",
  }],
  platform_account: [{
    type: Schema.Types.ObjectId,
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

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
