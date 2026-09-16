import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

// Load Poppins
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "700", "900"],
});

// Load Jost
const jost = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "600", "700"],
});


export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: {
      default: process.env.NEXT_PUBLIC_WEB_TITLE || "WebRobo",
      template: `%s - ${process.env.NEXT_PUBLIC_WEB_TITLE || "WebRobo"}`,
    },
    description: process.env.NEXT_PUBLIC_WEB_TITLE || "WebRobo",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${jost.variable} `}
      >
        <div className=""
          style={{
            background: `
      linear-gradient(to top, var(--rv-primary), rgba(0,0,0,0)),
      url('/images/doodle-bg2.svg')
    `,
            backgroundSize: "contain",
            backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
            height: "100vh",
          }}
        >
          {/* <div className="absolute inset-0 bg-black/40 z-0"></div> */}
          {children}
        </div>
      </body>
    </html >
  );
}
