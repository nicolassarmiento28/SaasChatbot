import { LandingLayout } from './LandingLayout';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ProductDescription } from './ProductDescription';
import { DemoChatWidget } from './DemoChatWidget';
import { DemoInstructions } from './DemoInstructions';
import { PricingSection } from './PricingSection';

export function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <ProductDescription />
      <div id="demo" className="lp-section lp-section--demo">
        <DemoInstructions />
        <DemoChatWidget />
      </div>
      <PricingSection />
    </LandingLayout>
  );
}
