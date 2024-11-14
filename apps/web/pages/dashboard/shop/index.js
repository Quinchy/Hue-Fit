import { useState, useEffect } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Plus, Search, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotepadText } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import routes from "@/routes";
import { useRouter } from "next/router";

export default function Shop() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchShops = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shops/get-shops?page=${page}&limit=7`);
      const data = await response.json();
      setShops(data.shops);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(currentPage);
  }, [currentPage]);

  const handleViewClick = (shopNo) => {
    router.push(routes.shopView.replace("[shopNo]", shopNo));
  };  

  const handleEditClick = (shopNo) => {
    router.push(routes.shopEdit.replace("[shopNo]", shopNo));
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Shops</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search shop" variant="icon" icon={Search} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Status 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                  <Button variant="none" className="text-base">Active</Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">Terminated</Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
          <Link className={buttonVariants({ variant: "default" })} href={routes.shopAdd}>
            <Plus className="scale-110 stroke-[3px]" />
            Add Shop
          </Link>
        </div>
      </div>
      <DashboardPagesNavigation>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shop}>
          Shops
        </Link>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shopRequest}>
          Requests
        </Link>
      </DashboardPagesNavigation>
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Shop Number</TableHead>
              <TableHead className="max-w-[3rem]">Shop Name</TableHead>
              <TableHead className="max-w-[4rem]">Address</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[1rem]"><Skeleton className="h-14 w-full" /></TableCell>
                    <TableCell className="max-w-[3rem]"><Skeleton className="h-14 w-full" /></TableCell>
                    <TableCell className="max-w-[4rem]"><Skeleton className="h-14 w-full" /></TableCell>
                    <TableCell className="max-w-[1rem] text-center"><Skeleton className="h-14 w-full" /></TableCell>
                    <TableCell className="max-w-[1rem] text-center"><Skeleton className="h-14 w-full" /></TableCell>
                  </TableRow>
                ))
              : shops.map((shop) => (
                  <TableRow key={shop.shopNo}>
                    <TableCell className="max-w-[1rem] font-medium">{shop.shopNo}</TableCell>
                    <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">{shop.name}</TableCell>
                    <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {`${shop.Address.buildingNo}, ${shop.Address.street}, ${shop.Address.barangay}, ${shop.Address.municipality}, ${shop.Address.province}, ${shop.Address.postalCode}`}
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <p className={`py-1 w-full rounded font-bold text-card ${shop.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"} uppercase`}>
                        {shop.status}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="font-normal">
                            Action  
                            <ChevronDown className="scale-125" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-50">
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                              <Button variant="none" className="text-base" onClick={() => handleViewClick(shop.shopNo)}>
                                <Eye className="scale-125" />
                                View
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button variant="none" className="text-base" onClick={() => handleEditClick(shop.shopNo)}>
                                <Pencil className="scale-125"/>
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button variant="none" className="font-bold text-base text-red-500">
                                <Trash2 className="scale-125 stroke-red-500" />
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
        <Pagination className="flex flex-col items-end">
          <PaginationContent>
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage < totalPages && (
              <PaginationNext href="#" onClick={() => setCurrentPage(currentPage + 1)} />
            )}
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
