import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Two-Factor Code", type: "text", required: false },
      },
      async authorize(credentials) {
        ('Authorize function started for email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          ('Error: Missing email or password.');
          throw new Error("Missing email or password");
        }

        try {
          await connectToDatabase();
          ('Database connected.');

          const user = await User.findOne({ email: credentials.email });
          ('User found:', user ? user.email : 'null');

          if (!user) {
            ('Error: No user found with this email.');
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            ('Error: User has no password set (or password field is empty).');
            throw new Error("User has no password set (e.g., social login)");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
          ('Password comparison result:', isValidPassword);

          if (!isValidPassword) {
            ('Error: Invalid password.');
            throw new Error("Invalid password");
          }

          // Password is correct. Now check for 2FA.
          const profile = await Profile.findOne({ user: user._id });
          ('Profile found for user:', profile ? 'Yes' : 'No');
          ('Profile twoFactorEnabled:', profile?.twoFactorEnabled);
          ('Profile twoFactorConfirmed:', profile?.twoFactorConfirmed);
          ('Credentials twoFactorCode:', credentials.twoFactorCode);


          if (profile?.twoFactorEnabled && profile?.twoFactorConfirmed) {
            ('2FA is enabled and confirmed for this user.');
            if (!credentials.twoFactorCode) {
              ('Error: 2FA enabled but no code provided. Throwing TwoFactorRequired.');
              throw new Error("TwoFactorRequired"); // Signal frontend to ask for code
            }

            if (!profile.twoFactorSecret) {
                ('Error: 2FA secret missing for enabled account.');
                throw new Error("2FA secret missing for enabled account.");
            }

            const isValid2FACode = authenticator.verify({
              token: credentials.twoFactorCode,
              secret: profile.twoFactorSecret,
            });
            ('2FA code verification result:', isValid2FACode);

            if (!isValid2FACode) {
              ('Error: Invalid 2FA code.');
              throw new Error("Invalid 2FA code");
            }
            ('2FA code successfully verified.');
          } else {
            ('2FA not enabled or not confirmed for this user. Proceeding without 2FA check.');
          }

          // If no 2FA required, or 2FA successfully verified, return the user
          ('User successfully authorized. Returning user object.');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error: any) {
          console.error("Auth error in authorize (caught): ", error.message);
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};