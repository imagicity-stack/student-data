import "./globals.css";

export const metadata = {
  title: "Admissions Dashboard",
  description: "Student admissions dashboard with analytics and data entry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
