// pages/partnership.js
import dynamic from "next/dynamic";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";

const PartnershipFormNoSSR = dynamic(
  () => import("@/components/ui/partnership/partnership-form"),
  { ssr: false }
);

export default function PartnershipPage() {
  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      <PartnershipFormNoSSR />
    </WebsiteLayoutWrapper>
  );
}
