import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Profile, { INotificationPreferences, IProfile } from "@/models/Profile";

export async function GET() {
  await connectToDatabase();
  try {
    let profile: IProfile | null = await Profile.findOne({});
    if (!profile) {
      profile = await Profile.create({
        firstName: "Default",
        lastName: "User",
        email: `default-user-${Date.now()}@example.com`,
      });
    }

    // Return only the notificationPreferences
    await new Promise((resolve) => setTimeout(resolve, 500));
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
        notificationPreferences: updatedPreferences, 
      });
    } else {
      profile.notificationPreferences = updatedPreferences;
      await profile.save();
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); 

    return NextResponse.json({
      message: "Notification preferences updated successfully!",
      preferences: profile?.notificationPreferences,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update notification preferences." },
      { status: 500 }
    );
  }
}
