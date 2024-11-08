import { Card } from "@/components/ui/card";

const DashboardPagesNavigation = ({ children }) => {
  return (
    <Card className="py-3 flex flex-row gap-5">
      {children}
    </Card>
  );
};

export default DashboardPagesNavigation;