import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { connectToDatabase } from "../../../../lib/db"; 
import User from "../../../../models/User";
import Profile from "../../../../models/Profile"; 
export async function POST() {
  try {
    await connectToDatabase(); 

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = session.user.email;
    const user = await User.findOne({ email: userEmail }).select('_id name email');
    if (!user) {
      return new NextResponse("User not found.", { status: 404 });
    }

    let profile = await Profile.findOne({ user: user._id });

    if (!profile) {
      const defaultFirstName = user.name || (user.email ? user.email.split('@')[0] : 'User');
      const defaultLastName = user.email ? (user.email.split('@')[1] ? user.email.split('@')[1].split('.')[0] : 'Lastname') : 'Lastname';
      
      profile = await Profile.create({
        user: user._id,
        email: user.email,
        firstName: defaultFirstName,
        lastName: defaultLastName,
      });
    }

    // Generate a new TOTP secret.
    // This secret should ONLY be saved after the user successfully verifies it.
    const secret = authenticator.generateSecret();

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "nextjs-fullstack"; // Use your application name
    // The keyuri format is standard for authenticator apps.
    // The 'issuer' is your app name, 'accountName' is typically the user's email or username.
    const otpauthUrl = authenticator.keyuri(userEmail, appName, secret);

    // Generate QR code as a data URL (e.g., 'data:image/png;base64,...')
    const qrCodeImage = await QRCode.toDataURL(otpauthUrl);

    // We return the secret temporarily; it's saved only upon successful verification in the /verify route.
    return NextResponse.json({ secret, otpauthUrl, qrCodeImage });
  } catch (error: unknown) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("2FA generate error:", errorMessage);
    // Log the full error object for better debugging on the server
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return new NextResponse(errorMessage, { status: 500 });
  }
}
