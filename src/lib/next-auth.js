// import CredentialsProvider from "next-auth/providers/credentials";
// import { DevLogin, loginUser } from "./functions";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;

//         const { username, password } = credentials;
//         let user = null;
//         if (username.startsWith("dev")) {
//           console.log("dev")
//           user = await DevLogin({ username, password });
//           } else {
//           console.log("normal")

//           user = await loginUser({ username, password });
//         }

//         return user; 
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   jwt: { secret: process.env.JWT_SECRET },
//   pages: { signIn: "/signin", error: "/signin?error=true" },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user = session.user || {};
//       session.user.id = token.id;
//       session.user.role = token.role;
//       session.user.name = token.name;
//       return session;
//     },
//   },
// };



import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser, DevLogin } from "@/lib/functions"; // local DB login

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const { username, password } = credentials;

        let user = null;

        if (username.startsWith("dev")) {
          user = await DevLogin({ username, password });
        } else {
          user = await loginUser({ username, password });
        }

        return user; // must return user object or null
      },
    }),
  ],
  session: { strategy: "jwt" },
  jwt: { secret: process.env.JWT_SECRET },
  pages: { signIn: "/signin", error: "/signin?error=true" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      return session;
    },
  },
};