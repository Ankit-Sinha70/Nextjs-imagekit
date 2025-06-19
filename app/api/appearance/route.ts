import { connectToDatabase } from '@/lib/db';
import Profile, { IAppearanceSettings, IProfile } from '@/models/Profile';
import { NextResponse } from 'next/server';

// GET /api/appearance - Fetches the user's appearance settings
export async function GET() {
  await connectToDatabase();

  try {
    let profile: IProfile | null = await Profile.findOne({});

    // If no profile exists, create one with default appearance settings
    if (!profile) {
      profile = await Profile.create({
        firstName: 'Default',
        lastName: 'User',
        email: `default-user-${Date.now()}@example.com`,
        // Other default fields will be set by schema defaults
      });
    }

    // Return only the appearanceSettings
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return NextResponse.json(profile?.appearanceSettings);

  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json({ message: 'Failed to fetch appearance settings.' }, { status: 500 });
  }
}

// PUT /api/appearance - Updates the user's appearance settings
export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const updatedSettings: IAppearanceSettings = await request.json();

    let profile: IProfile | null = await Profile.findOne({});

    if (!profile) {
      // If no profile exists, create one and then update its settings
      profile = await Profile.create({
        firstName: 'New',
        lastName: 'User',
        email: `temp-user-${Date.now()}@example.com`,
        appearanceSettings: updatedSettings, // Set received settings
      });
    } else {
      // Update the existing profile's appearance settings
      // Ensure only allowed fields are updated to prevent arbitrary data injection
      profile.appearanceSettings = {
        ...profile.appearanceSettings, // Keep existing if not provided
        theme: updatedSettings.theme || profile.appearanceSettings.theme,
        fontSize: updatedSettings.fontSize || profile.appearanceSettings.fontSize,
        compactMode: updatedSettings.compactMode ?? profile.appearanceSettings.compactMode, // Handle boolean
        showAnimations: updatedSettings.showAnimations ?? profile.appearanceSettings.showAnimations, // Handle boolean
        accentColor: updatedSettings.accentColor || profile.appearanceSettings.accentColor,
      };
      await profile.save();
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

    return NextResponse.json({ message: 'Appearance settings updated successfully!', settings: profile?.appearanceSettings });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json({ message: 'Failed to update appearance settings.' }, { status: 500 });
  }
} 