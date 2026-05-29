import "./globals.css";
import RootLayoutContent from "./layout-content";

import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function generateMetadata() {
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    
    const iconUrl = settings?.faviconUrl || '/favicon.ico';
    
    return {
      title: settings?.workshopName || "GalÇal 26 | Lise Çalıştayı",
      description: settings?.shortDescription || "Modern ve profesyonel lise çalıştayı bilgilendirme platformu.",
      icons: {
        icon: [
          { url: iconUrl },
          { url: iconUrl, rel: 'shortcut icon' },
          { url: iconUrl, rel: 'apple-touch-icon' }
        ],
      },
      verification: {
        google: "o9BUx7Ggn-D81rkb0MeL0W9guC_fhlqYAeMIAipPtL4",
      }
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "GalÇal 26 | Lise Çalıştayı",
      verification: {
        google: "o9BUx7Ggn-D81rkb0MeL0W9guC_fhlqYAeMIAipPtL4",
      }
    };
  }
}

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
