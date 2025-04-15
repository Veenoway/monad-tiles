import { Home } from "@/features/home";

export default function HomePage() {
  return (
    <main
      className="w-screen flex items-center justify-center flex-col min-h-screen pb-[100px] font-montserrat"
      style={{
        background: "url('/background/bg-site.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        fontFamily: "Boogaloo",
      }}
    >
      <Home />
    </main>
  );
}
