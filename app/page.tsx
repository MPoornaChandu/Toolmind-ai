import AgentDemo from "@/components/AgentDemo";
import Architecture from "@/components/Architecture";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ScrollStory from "@/components/ScrollStory";
import ToolOrbit from "@/components/ToolOrbit";
import ToolRevealCards from "@/components/ToolRevealCards";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <ScrollStory />
        <AgentDemo />
        <ToolOrbit />
        <Architecture />
        <ToolRevealCards />
        <FeatureCards />
      </main>
      <Footer />
    </>
  );
}
