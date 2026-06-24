import React from "react";
import { Providers } from "@/store/providers";
import MyApp from "./app";
import "./global.css";


export const metadata = {
  title: "Quản lý tập trung",
  description: "Modernize Main kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <MyApp>{children}</MyApp>
        </Providers>
      </body>
    </html>
  );
}
