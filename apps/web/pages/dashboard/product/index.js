import { useState, useEffect } from "react";
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

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAndCacheProducts = async () => {
      setIsLoading(true);

      // Get cached data from local storage
      const cachedData = JSON.parse(localStorage.getItem("productsCache"));
      const cachedTypes = JSON.parse(localStorage.getItem("typesCache"));
      const cachedPage = cachedData?.currentPage;
      const cachedSearch = cachedData?.searchTerm;
      const cachedType = cachedData?.selectedType;
      const cachedProducts = cachedData?.products || [];
      const cachedTotalPages = cachedData?.totalPages || 1;

      // If the cached data matches current parameters, use it
      if (
        cachedPage === currentPage &&
        cachedSearch === searchTerm &&
        cachedType === selectedType &&
        cachedTypes
      ) {
        setProducts(cachedProducts);
        setTotalPages(cachedTotalPages);
        setTypes(cachedTypes);
        setIsLoading(false);
      } 
      else {
        // Fetch updated data from the server
        const res = await fetch(
          `/api/products/get-product?page=${currentPage}&search=${searchTerm}&type=${selectedType !== "ALL" ? selectedType : ""}`
        );
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTypes(data.types || []);

          // Store the data in local storage
          localStorage.setItem(
            "productsCache",
            JSON.stringify({
              currentPage: data.currentPage || 1,
              searchTerm,
              selectedType,
              products: data.products,
              totalPages: data.totalPages || 1,
            })
          );

          localStorage.setItem("typesCache", JSON.stringify(data.types || []));
        } 
        else {
          console.error("Failed to fetch products", data.message);
        }

        setIsLoading(false);
      }
    };

    fetchAndCacheProducts();
  }, [currentPage, searchTerm, selectedType]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
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

  return (
    <DashboardLayoutWrapper>
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
                {types.map((type) => (
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
        {isLoading ? (
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
              {Array.from({ length: 9 }).map((_, index) => (
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
              ))}
            </TableBody>
          </Table>
        ) : products.length === 0 ? (
          <div className="text-center text-lg font-semibold text-gray-500 py-10">
            No products found for {selectedType !== "ALL" ? `"${selectedType}"` : "the selected criteria"}.
          </div>
        ) : (
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
              {products.map((product) => (
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
                          : "bg-gray-800"
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
              ))}
            </TableBody>
          </Table>
        )}
        {products.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
