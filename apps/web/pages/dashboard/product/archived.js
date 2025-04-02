import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import routes from "@/routes";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  X,
  Plus,
  NotepadText,
  Search,
  ChevronDown,
  Eye,
  Pencil,
  Package,
  Copy,
  CheckCircle2,
  CircleAlert,
  Archive,
  Loader,
} from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import { useRouter as useNextRouter } from "next/router";

const fetcher = (url) => fetch(url).then((res) => res.json());

function CopyableText({ text, displayText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="flex items-center justify-evenly -ml-5 mr-2 relative">
      {displayText}
      <Button
        variant="none"
        onClick={handleCopy}
        className="transition-all active:scale-75 hover:opacity-75 duration-300 ease-in-out"
      >
        <Copy className="scale-100" />
      </Button>
      <div
        className={`absolute top-0 right-2 -translate-x-1/2 mt-1 px-2 py-1 bg-primary text-pure rounded shadow text-xs transition-opacity ease-in-out duration-500 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        Copied!
      </div>
    </div>
  );
}

export default function ArchivedProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const router = useNextRouter();
  // State for Unarchive dialog
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveProductNo, setArchiveProductNo] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveAlert, setArchiveAlert] = useState(false);

  // Use get-product API and pass archived=true to fetch only archived products
  const {
    data: productsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `/api/products/get-product?page=${currentPage}&search=${searchTerm}&type=${
      selectedType !== "ALL" ? selectedType : ""
    }&archived=true`,
    fetcher,
    { refreshInterval: 5000 }
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

  const handleStockClick = (productNo) => {
    router.push(routes.productStock.replace("[productNo]", productNo));
  };

  // Open unarchive dialog and store productNo
  const openArchiveDialog = (productNo) => {
    setArchiveProductNo(productNo);
    setArchiveDialogOpen(true);
  };

  // Unarchive handler: disable buttons while unarchiving, show spinner on Yes.
  const confirmArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(
        `/api/products/unarchive-product?productNo=${archiveProductNo}`,
        { method: "POST" }
      );
      if (res.ok) {
        mutate();
        setArchiveAlert(true);
        setTimeout(() => setArchiveAlert(false), 5000);
      } else {
        console.error("Unarchive failed");
      }
    } catch (error) {
      console.error("Error unarchiving product:", error);
    }
    setArchiving(false);
    setArchiveDialogOpen(false);
    setArchiveProductNo(null);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  return (
    <DashboardLayoutWrapper>
      {archiveAlert && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Product Unarchived
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The product has been unarchived successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setArchiveAlert(false)}
          >
            <X className="-translate-x-[0.85rem]" />
          </Button>
        </Alert>
      )}

      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Unarchive</DialogTitle>
          <DialogDescription>
            Are you sure you want to unarchive this product?
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={confirmArchive}
              className="w-20"
              disabled={archiving}
            >
              {archiving ? <Loader className="animate-spin" /> : "Yes"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-20" disabled={archiving}>
                No
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Archived</CardTitle>
        <div className="flex flex-row items-center gap-2">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search products"
            variant="icon"
            icon={Search}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="justify-center"
                  onClick={() => handleTypeSelect("ALL")}
                >
                  <Button variant="none">ALL</Button>
                </DropdownMenuItem>
                {productsData?.types?.map((type) => (
                  <DropdownMenuItem
                    key={type.name}
                    className="justify-center"
                    onClick={() => handleTypeSelect(type.name)}
                  >
                    <Button variant="none">{type.name}</Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            className={buttonVariants({ variant: "default" })}
            href={routes.productAdd}
          >
            <Plus className="scale-110 stroke-[3px]" />
            Add Product
          </Link>
        </div>
      </div>
      <Card className="flex flex-col p-5 gap-5 min-h-[49.1rem]">
        <DashboardPagesNavigation
          items={[
            { label: "Products", href: routes.product },
            { label: "Archived", href: routes.archivedProduct },
          ]}
        />
        <div className="flex flex-col gap-4 justify-between min-h-[42rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%]"></TableHead>
                <TableHead className="w-[11%]">Product Number</TableHead>
                <TableHead className="w-[60%]">Name</TableHead>
                <TableHead className="w-[10%] text-center">Quantity</TableHead>
                <TableHead className="w-[10%] text-center">Type</TableHead>
                <TableHead className="w-[10%] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || !productsData ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                  </TableRow>
                ))
              ) : productsData.products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center align-middle h-[39.5rem] text-primary/50 text-lg font-thin tracking-wide"
                  >
                    No archived products found for{" "}
                    {selectedType !== "ALL"
                      ? `"${selectedType}"`
                      : "the selected criteria"}
                    .
                  </TableCell>
                </TableRow>
              ) : (
                productsData.products.map((product) => {
                  const shortProductNo =
                    product.productNo.length > 14
                      ? product.productNo.slice(0, 14) + "..."
                      : product.productNo;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-10 h-10">
                          <Image
                            src={product.thumbnailURL}
                            alt={product.name}
                            fill
                            quality={75}
                            className="object-cover rounded-[0.25rem]"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <CopyableText
                          text={product.productNo}
                          displayText={shortProductNo}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-center">
                        {product.totalQuantity}
                        {product.ProductVariant &&
                          product.ProductVariant.some(
                            (variant) =>
                              variant.ProductVariantSize &&
                              variant.ProductVariantSize.some(
                                (pvs) => pvs.quantity <= 5
                              )
                          ) && (
                            <CircleAlert
                              width={15}
                              className="text-red-500/75 inline-block ml-1 mb-[0.10rem]"
                            />
                          )}
                      </TableCell>
                      <TableCell className="text-center">
                        <p
                          className={`py-1 w-full rounded text-center font-bold ${
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
                      <TableCell>
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
                                <Button
                                  variant="none"
                                  onClick={() =>
                                    handleViewClick(product.productNo)
                                  }
                                >
                                  <Eye className="scale-125" />
                                  View
                                </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="justify-center">
                                <Button
                                  variant="none"
                                  onClick={() =>
                                    handleEditClick(product.productNo)
                                  }
                                >
                                  <Pencil className="scale-125" />
                                  Edit
                                </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="justify-center">
                                <Button
                                  variant="none"
                                  onClick={() =>
                                    handleStockClick(product.productNo)
                                  }
                                >
                                  <Package className="scale-125" />
                                  Stock
                                </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="justify-center focus:bg-orange-500/25">
                                <Button
                                  variant="none"
                                  onClick={() =>
                                    openArchiveDialog(product.productNo)
                                  }
                                  className="text-orange-500"
                                >
                                  <Archive className="scale-125" />
                                  Unarchive
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {productsData?.products?.length > 0 && (
            <Pagination className="flex flex-col items-end">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                )}
                {Array.from(
                  { length: productsData.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < productsData.totalPages && (
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
