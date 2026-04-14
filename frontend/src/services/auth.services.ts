
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_AUTH_URL;

export const userService = {
  getSession: async function () {
    try {
      const cookieStore = await cookies();

      console.log(cookieStore.toString());

      const res = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });

      const session = await res.json();

      if (session === null) {
        return { data: null, error: { message: "Session is missing." } };
      }

      return { data: session, error: null };
    } catch (err) {
      console.error(err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};