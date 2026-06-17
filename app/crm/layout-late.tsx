import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <Header />

    <main className="md:ml-64 pt-20 px-4 md:px-6 pb-12">{children}</main>
    </>
  );
}
