import { CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddSizeDialog from "./components/add-size";

export default function Sizes() {
  const router = useRouter();
  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col justify-between gap-7">
        <div className="flex justify-between items-center mb-5">
          <CardTitle className="text-4xl">Sizes</CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
              <MoveLeft className="scale-125" />
              Back to Maintenance
            </Button>
            <AddSizeDialog />
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  )
}