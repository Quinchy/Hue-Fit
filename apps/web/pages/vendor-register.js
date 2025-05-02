// pages/partnership.js
import dynamic from "next/dynamic";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { LenisProvider } from "@/providers/lenis-provider";

const PartnershipFormNoSSR = dynamic(
  () => import("@/components/ui/partnership/partnership-form"),
  { ssr: false }
);

export default function PartnershipPage() {
  return (
    <LenisProvider options={{
      duration: 1.75,
    }}>      
      <WebsiteLayoutWrapper className="justify-center items-center">
        <PartnershipFormNoSSR />
      </WebsiteLayoutWrapper>
    </LenisProvider>
  );
}
