import "./globals.css";

export const metadata = {
  title: "Student Management System | Modern Education Platform",
  description: "A comprehensive solution for managing student records, grades, and school administration.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
