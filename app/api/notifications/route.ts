import { NextResponse } from "next/server"; // Corrected path: removed one '../'
import { connectToDatabase } from "@/lib/db";
import Profile, { INotificationPreferences, IProfile } from "@/models/Profile";

// GET /api/notifications - Fetches the user's notification preferences
export async function GET() {
  await connectToDatabase();
  try {
    let profile: IProfile | null = await Profile.findOne({});
    // If no profile exists, create one with default notification preferences
    if (!profile) {
      profile = await Profile.create({
        firstName: "Default",
        lastName: "User",
        email: `default-user-${Date.now()}@example.com`,
        // Other default fields will be set by schema defaults
      });
      console.log(
        "Created initial default profile for notifications:",
        profile
      );
    }

    // Return only the notificationPreferences
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return NextResponse.json(profile?.notificationPreferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { message: "Failed to fetch notification preferences." },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Updates the user's notification preferences
export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const updatedPreferences: INotificationPreferences = await request.json();

    let profile: IProfile | null = await Profile.findOne({});

    if (!profile) {
      // If no profile exists, create one and then update its preferences
      profile = await Profile.create({
        firstName: "New",
        lastName: "User",
        email: `temp-user-${Date.now()}@example.com`,
        notificationPreferences: updatedPreferences, // Set received preferences
      });
      console.log(
        "Created new profile and set notification preferences:",
        profile
      );
    } else {
      // Update the existing profile's notification preferences
      profile.notificationPreferences = updatedPreferences;
      await profile.save();
      console.log(
        "Updated notification preferences for existing profile:",
        profile.notificationPreferences
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

    return NextResponse.json({
      message: "Notification preferences updated successfully!",
      preferences: profile?.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { message: "Failed to update notification preferences." },
      { status: 500 }
    );
  }
}
