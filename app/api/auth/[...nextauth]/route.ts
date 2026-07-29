import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";

// Sengaja TANPA nilai cadangan. Kunci ini yang dipakai nandatangani token
// sesi login — kalau ditulis di kode, siapa pun yang baca repo bisa bikin
// token palsu dan masuk sebagai admin. Lebih baik aplikasinya berhenti dengan
// pesan jelas daripada jalan tapi bolong.
const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "NEXTAUTH_SECRET belum diisi."
  );
}

export const authOptions: NextAuthOptions = {
  secret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Arahkan ke halaman login custom
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password harus diisi!");
        }

        // Cari user di database berdasarkan email
        const users = await sql`SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1`;
        const user = users[0];

        if (!user) {
          throw new Error("Email tidak ditemukan!");
        }

        // Cek kecocokan password menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error("Password salah!");
        }

        // Jika berhasil, kembalikan objek user (akan disimpan di JWT session)
        return {
          id: user.id.toString(),
          name: user.nama,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
