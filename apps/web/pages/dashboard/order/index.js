import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Pencil, Trash2, Search, ChevronDown } from "lucide-react";

const ordersData = {
  orders: [
    { orderNo: "ORD002", customerName: "Jane Smith", totalQuantity: 5, status: "Preparing" },
  ],
  totalPages: 1,
};

export default function Orders() {
  const router = useRouter();

  const handleViewClick = (orderNo) => {
    router.push(`/dashboard/order/view/${orderNo}`);
  };

  const handleEditClick = (orderNo) => {
    router.push(`/dashboard/order/edit/${orderNo}`);
  };

  return (
    <DashboardLayoutWrapper>
      {/* Page Header */}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Orders</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search order" variant="icon" icon={Search} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <ChevronDown className="scale-125" />
                Filter by Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Button variant="none">Processing</Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="none">Preparing</Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="none">Packaging</Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Order Number</TableHead>
              <TableHead className="max-w-[3rem]">Customer Name</TableHead>
              <TableHead className="max-w-[1rem] text-center">Quantity</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData.orders.map((order) => (
              <TableRow key={order.orderNo}>
                <TableCell>{order.orderNo}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-center">{order.totalQuantity}</TableCell>
                <TableCell className="text-center">
                  <p
                    className={`py-1 w-full rounded font-bold ${
                      order.status === "Processing"
                        ? "bg-yellow-500"
                        : order.status === "Preparing"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    } uppercase`}
                  >
                    {order.status}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="font-normal">
                        Action
                        <ChevronDown className="scale-125" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Button variant="none" onClick={() => handleViewClick(order.orderNo)}>
                            <Eye className="scale-125 mr-2" />
                            View
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Button variant="none" onClick={() => handleEditClick(order.orderNo)}>
                            <Pencil className="scale-125 mr-2" />
                            Edit
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Button variant="none" className="text-red-500">
                            <Trash2 className="scale-125 mr-2" />
                            Delete
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayoutWrapper>
  );
}
