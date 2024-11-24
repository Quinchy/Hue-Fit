import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import routes from "@/routes";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, NotepadText, Search, ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const { data: productsData, error, isLoading } = useSWR(
    `/api/products/get-product?page=${currentPage}&search=${searchTerm}&type=${selectedType !== "ALL" ? selectedType : ""}`,
    fetcher
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (productsData?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = (productNo) => {
    router.push(routes.productView.replace("[productNo]", productNo));
  };

  const handleEditClick = (productNo) => {
    router.push(routes.productEdit.replace("[productNo]", productNo));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  if (router.query.success === "true" && !showAlert) {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    router.replace("/dashboard/product", undefined, { shallow: true });
  }

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Product Added</AlertTitle>
            <AlertDescription className="text-green-300">The product has been added successfully.</AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Products</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search products"
            variant="icon"
            icon={Search}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Link className={buttonVariants({ variant: "default" })} href={routes.productAdd}>
            <Plus className="scale-110 stroke-[3px]" />
            Add Product
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                {"Filter by Type"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem className="justify-center" onClick={() => handleTypeSelect("ALL")}>
                  <Button variant="none">ALL</Button>
                </DropdownMenuItem>
                {productsData?.types?.map((type) => (
                  <DropdownMenuItem key={type.name} className="justify-center" onClick={() => handleTypeSelect(type.name)}>
                    <Button variant="none">{type.name}</Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Number</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !productsData
              ? Array.from({ length: 9 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="w-full h-12 bg-accent rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full h-12 bg-accent rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-full h-12 bg-accent rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-full h-12 bg-accent rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="w-full h-12 bg-accent rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              : productsData.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center align-middle h-[30rem] text-primary/50 text-lg font-thin tracking-wide">
                    No products found for {selectedType !== "ALL" ? `"${selectedType}"` : "the selected criteria"}.
                  </TableCell>
                </TableRow>
              ) : (
                productsData.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="w-3/12">{product.productNo}</TableCell>
                    <TableCell className="w-6/12">{product.name}</TableCell>
                    <TableCell className="text-center">{product.totalQuantity}</TableCell>
                    <TableCell className="w-[10%] text-center">
                      <p
                        className={`py-1 w-full rounded font-bold ${
                          product.Type.name === "UPPERWEAR"
                            ? "bg-blue-500"
                            : product.Type.name === "LOWERWEAR"
                            ? "bg-teal-500"
                            : product.Type.name === "FOOTWEAR"
                            ? "bg-purple-500"
                            : product.Type.name === "OUTERWEAR"
                            ? "bg-cyan-500"
                            : "bg-gray-300"
                        } uppercase`}
                      >
                        {product.Type.name}
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
                        <DropdownMenuContent className="w-50">
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="justify-center">
                              <Button variant="none" onClick={() => handleViewClick(product.productNo)}>
                                <Eye className="scale-125" />
                                View
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button variant="none" onClick={() => handleEditClick(product.productNo)}>
                                <Pencil className="scale-125" />
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button variant="none" className="font-bold text-red-500">
                                <Trash2 className="scale-125 stroke-red-500" />
                                Delete
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
        {productsData?.products?.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < productsData.totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
