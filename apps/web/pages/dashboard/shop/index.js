import { useState, useEffect } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, CircleMinus, Plus, Search, ChevronDown } from "lucide-react";
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
  const navItems = [
    { label: "Shops", href: routes.shop },
    { label: "Requests", href: routes.shopRequest },
  ];

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
      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <DashboardPagesNavigation items={navItems} />
        <div className="flex flex-col justify-between min-h-[42rem] gap-4">
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
              : shops.length > 0
                ? shops.map((shop) => (
                    <TableRow key={shop.shopNo}>
                      <TableCell className="max-w-[1rem] font-medium">{shop.shopNo}</TableCell>
                      <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">{shop.name}</TableCell>
                      <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">
                        {`${shop.ShopAddress.buildingNo}, ${shop.ShopAddress.street}, ${shop.ShopAddress.barangay}, ${shop.ShopAddress.municipality}, ${shop.ShopAddress.province}, ${shop.ShopAddress.postalCode}`}
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
                                  <CircleMinus className="scale-125 stroke-red-500" />
                                  Closed
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu> 
                      </TableCell>
                    </TableRow>
                  ))
                : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center align-middle h-[35rem] text-primary/50 text-lg font-thin tracking-wide">
                      There are no partnered shop yet. 
                    </TableCell>
                  </TableRow>
                )
            }
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
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
