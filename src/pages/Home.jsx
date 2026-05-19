import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';


export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full pt-14 sm:pt-16 pb-8">
      <div className="flex flex-col w-full gap-8 lg:gap-10">
        <Hero />
        <FeatureCards />
      </div>
    </div>
  );
}
