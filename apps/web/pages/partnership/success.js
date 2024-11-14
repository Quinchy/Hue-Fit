// Success Component
// File: success.js

import { Card, CardTitle } from "@/components/ui/card";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Send } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import routes from "@/routes";

export default function SuccessPage() {
  return (
    <WebsiteLayoutWrapper>
      <Card className="flex flex-col items-center p-12 text-center max-w-[50rem] gap-14">
        <CardTitle className="flex flex-row items-center text-4xl font-bold gap-3"><Send className="stroke-[2.5px]" /> Partnership Request Has Been Sent</CardTitle>
        <div className="flex flex-col gap-4 p-5">
          <p className="text-lg font-thin">
            {"Thank you for submitting your partnership request! We're thrilled at the opportunity to work together and help bring your vision to life. "}
          </p>
          <p className="text-lg font-thin">
            {"Please keep an eye on your email for further updates. Once we have reviewed your information and confirmed your account, you'll receive detailed instructions on the next steps to get fully set up as a vendor. "}
          </p>
        </div>
        <Link 
          className={buttonVariants({ variant: "outline" })}
          href={routes.home}
        >
          Back to Home
        </Link>
      </Card>
    </WebsiteLayoutWrapper>
  );
}
