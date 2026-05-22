import "./globals.css";

export const metadata = {
  title: "Student Admission Form",
  description: "Student admission data entry form",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
