import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums";

// import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";
import envVars from "../config";
// If your Prisma file is located elsewhere, you can change the path

const isHttps = process.env.NODE_ENV === "production" || envVars.BETTER_AUTH_URL.startsWith("https");

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },

    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
            mapProfileToUser: (profile) => {
                return {
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: Role.USER,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null,
                }
            }
        }
    },

    // emailVerification:{
    //     sendOnSignUp: true,
    //     sendOnSignIn: true,
    //     autoSignInAfterVerification: true,
    // },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER
            },

            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },

            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        }
    },

    plugins: [
        bearer(),
        // emailOTP({
        //     overrideDefaultEmailVerification: true,
        //     async sendVerificationOTP({email, otp, type}) {
        //         if(type === "email-verification"){
        //           const user = await prisma.user.findUnique({
        //             where : {
        //                 email,
        //             }
        //           })

        //            if(!user){
        //             console.error(`User with email ${email} not found. Cannot send verification OTP.`);
        //             return;
        //            }

        //            if(user && user.role === Role.ADMIN){
        //             console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
        //             return;
        //            }

        //             if (user && !user.emailVerified){
        //            await sendEmail({
        //                 to : email,
        //                 subject : "Verify your email",
        //                 templateName : "otp",
        //                 templateData :{
        //                     name : user.name,
        //                     otp,
        //                 }
        //             })
        //           }
        //         }else if(type === "forget-password"){
        //             const user = await prisma.user.findUnique({
        //                 where : {
        //                     email,
        //                 }
        //             })

        //             if(user){
        //                 sendEmail({
        //                     to : email,
        //                     subject : "Password Reset OTP",
        //                     templateName : "otp",
        //                     templateData :{
        //                         name : user.name,
        //                         otp,
        //                     }
        //                 })
        //             }
        //         }
        //     },
        //     expiresIn : 10 * 60, // 2 minutes in seconds
        //     otpLength : 6,
        // })
    ],

    session: {
        expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
        updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
        }
    },

    // Allow the backend's own success route and the frontend as trusted redirect targets
    trustedOrigins: [
        envVars.BETTER_AUTH_URL,
        envVars.FRONTEND_URL,
    ],

    advanced: {
        useSecureCookies: isHttps,
        cookies: {
            // sameSite: "none" REQUIRES secure: true (browsers drop it on plain HTTP).
            // Use "lax" for HTTP (localhost) so the state cookie is actually saved.
            state: {
                attributes: {
                    sameSite: isHttps ? "none" : "lax",
                    secure: isHttps,
                    httpOnly: true,
                    path: "/",
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: isHttps ? "none" : "lax",
                    secure: isHttps,
                    httpOnly: true,
                    path: "/",
                }
            }
        }
    }

});