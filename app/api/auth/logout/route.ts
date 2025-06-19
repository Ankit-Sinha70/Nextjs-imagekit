import { NextResponse } from "next/server";

export async function POST() {
  try {
    // You can add any cleanup logic here if needed
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 }
    );
  }
}
