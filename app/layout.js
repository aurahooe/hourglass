import "./globals.css";

export const metadata = {
  title: "Hourglass",
  description: "A living desk that turns over every hour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <header className="top">
            <a className="mark" href="/">
              Hour<span>glass</span>
            </a>
            <nav className="topnav">
              <a href="/">Floor</a>
              <a href="/desk">Desk</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
