import "./globals.css";
import RootLayoutContent from "./layout-content";

export const metadata = {
  title: "GalÇal 26 | Lise Çalıştayı",
  description: "Modern ve profesyonel lise çalıştayı bilgilendirme platformu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </body>
    </html>
  );
}
