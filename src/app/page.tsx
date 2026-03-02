import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ArtistStatement from "@/components/ArtistStatement";
import Portfolio from "@/components/Portfolio";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ArtistStatement />
      <Portfolio />
      <Footer />
    </main>
  );
}
