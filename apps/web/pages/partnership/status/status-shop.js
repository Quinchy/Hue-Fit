import { Card, CardTitle } from "@/components/ui/card";
import { Store, LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function StatusPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.firstName || "";

  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center gap-20">
      <Card className="flex flex-col items-center p-12 text-center max-w-[50rem] gap-2">
        <CardTitle className="flex flex-row items-center text-2xl font-bold gap-1">
          <Store className="stroke-[2.5px]" />
          Your Shop is being processed.
        </CardTitle>
        <div className="flex flex-col gap-4 p-5">
          <p className="text-lg font-thin">
            {"Hi, "}{firstName}{". Please keep an eye on your email for the result. Once reviewed, you'll gain access to the dashboard and start selling."}
          </p>
        </div>
        <Button
          className={buttonVariants({ variant: "outline" })}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          Log out
        </Button>
      </Card>
    </div>
  );
}
