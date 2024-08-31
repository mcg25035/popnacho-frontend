import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "pop-nacho",
    description: "Popnacho is a simple clicking game made by nachoneko's fans.",
};

export default function RootLayout({ children }) {
    return (
        <html>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
