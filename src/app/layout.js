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
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
