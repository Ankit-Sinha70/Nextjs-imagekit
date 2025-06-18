import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for your Profile document
export interface IProfile extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  // New fields for security settings
  hashedPassword?: string; // Storing hashed password
  twoFactorEnabled: boolean; // Status of 2FA
}

// Define the Profile Schema
const ProfileSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  location: { type: String, required: false },
  bio: { type: String, required: false },
  avatar: { type: String, required: false },
  // New fields for security settings
  hashedPassword: { type: String, required: false },
  twoFactorEnabled: { type: Boolean, default: false },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Export the Mongoose model. If the model already exists, use it. Otherwise, create it.
const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile; 