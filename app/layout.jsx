import './globals.css';

export const metadata = {
  title: 'Prowider Mini Lead Distribution',
  description: 'Lead distribution system with mandatory and fair provider allocation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
