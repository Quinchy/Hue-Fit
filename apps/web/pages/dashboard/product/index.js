import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/router';
import routes from '@/routes';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Plus, NotepadText, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Pagination, PaginationPrevious, PaginationContent, PaginationItem,
         PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Added state for search term
  const router = useRouter();

  // Fetch products from API, including search term
  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch(`/api/products/get-product?page=${currentPage}&search=${searchTerm}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } else {
        console.error("Failed to fetch products", data.message);
      }
    }

    fetchProducts();
  }, [currentPage, searchTerm]); // Update useEffect to depend on both currentPage and searchTerm

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term when user types
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = (productNo) => {
    router.push(`/product/view/${productNo}`);
  };

  const handleEditClick = (productNo) => {
    router.push(`/product/edit/${productNo}`);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Products</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search inquiries"
            variant="icon"
            icon={Search}
            value={searchTerm} // Bind the search input to the state
            onChange={handleSearchChange} // Handle input changes
          />
          <Link className={buttonVariants({ variant: "default" })} href={routes.productAdd}>
              <Plus className="scale-110 stroke-[3px]" />
              Add Product
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Button variant="none">Upper Wear</Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="none">Lower Wear</Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="none">Foot Wear</Button>
                </DropdownMenuItem>
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.productNo}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-center">{product.totalQuantity}</TableCell>
                <TableCell className="text-center">
                  <p className={`py-1 w-full rounded font-bold ${product.Type.name === "Upper Wear" ? "bg-blue-500" : product.Type.name === "Lower Wear" ? "bg-teal-500" : "bg-purple-500"} uppercase`}>
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
                        <DropdownMenuItem>
                          <Button variant="none" onClick={() => handleViewClick(product.productNo)}>
                            <Eye className="scale-125" />
                            View
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Button variant="none" onClick={() => handleEditClick(product.productNo)}>
                            <Pencil className="scale-125" />
                            Edit
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
        <Pagination>
          <PaginationContent>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page} active={page === currentPage}>
                <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
