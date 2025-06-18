import mongoose, { Schema, Document } from 'mongoose';

// Define sub-interface for individual channel settings
export interface IChannelSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

// Define interface for Notification Preferences object
export interface INotificationPreferences {
  security: IChannelSettings;
  updates: IChannelSettings;
  marketing: IChannelSettings;
  activity: IChannelSettings;
}

// Define interface for Appearance Settings object
export interface IAppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAnimations: boolean;
  accentColor: string;
}

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
  notificationPreferences: INotificationPreferences; // New field
  appearanceSettings: IAppearanceSettings; // New field
}

// Define ChannelSettings Schema
const ChannelSettingsSchema: Schema = new Schema({
  email: { type: Boolean, default: false },
  push: { type: Boolean, default: false },
  sms: { type: Boolean, default: false },
  inApp: { type: Boolean, default: false },
}, { _id: false }); // Do not create an _id for subdocuments

// Define AppearanceSettings Schema
const AppearanceSettingsSchema: Schema = new Schema({
  theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light', required: true },
  fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium', required: true },
  compactMode: { type: Boolean, default: false },
  showAnimations: { type: Boolean, default: true },
  accentColor: { type: String, default: 'blue', required: true },
}, { _id: false });

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
  notificationPreferences: { // New field using nested schemas
    security: { type: ChannelSettingsSchema, default: { email: true, push: true, sms: false, inApp: true } },
    updates: { type: ChannelSettingsSchema, default: { email: true, push: false, sms: false, inApp: true } },
    marketing: { type: ChannelSettingsSchema, default: { email: false, push: false, sms: false, inApp: false } },
    activity: { type: ChannelSettingsSchema, default: { email: true, push: true, sms: false, inApp: true } },
  },
  appearanceSettings: { type: AppearanceSettingsSchema, default: { theme: 'light', fontSize: 'medium', compactMode: false, showAnimations: true, accentColor: 'blue' } }, // New field with defaults
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Export the Mongoose model. If the model already exists, use it. Otherwise, create it.
const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile; 