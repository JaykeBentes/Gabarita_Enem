import type { Metadata } from "next";
import { initDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "AppEnem Backend",
  description: "Backend API for AppEnem",
};

// Inicializar banco de dados quando o app iniciar
initDatabase().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}