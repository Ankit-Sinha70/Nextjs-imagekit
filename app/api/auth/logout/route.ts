import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    let errorMessage = "Error during logout";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(errorMessage, error);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
