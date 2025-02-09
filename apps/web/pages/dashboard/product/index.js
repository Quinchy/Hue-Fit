// pages/dashboard/product/index.js
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import routes from '@/routes';
import DashboardLayoutWrapper from '@/components/ui/dashboard-layout';
import { Card, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const { data: productsData, error, isLoading } = useSWR(
    `/api/products/get-product?page=${currentPage}&search=${searchTerm}&type=${
      selectedType !== 'ALL' ? selectedType : ''
    }`,
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
    router.push(routes.productView.replace('[productNo]', productNo));
  };

  const handleEditClick = (productNo) => {
    router.push(routes.productEdit.replace('[productNo]', productNo));
  };

  const handleStockClick = (productNo) => {
    router.push(routes.productStock.replace('[productNo]', productNo));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  if (router.query.success === 'true' && !showAlert) {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
    router.replace('/dashboard/product', undefined, { shallow: true });
  }

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Product Added
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The product has been added successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setShowAlert(false)}
          >
            <X />
          </Button>
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
          <Link
            className={buttonVariants({ variant: 'default' })}
            href={routes.productAdd}
          >
            <Plus className="scale-110 stroke-[3px]" />
            Add Product
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                {'Filter by Type'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="justify-center"
                  onClick={() => handleTypeSelect('ALL')}
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
        </div>
      </div>
      <Card className="flex flex-col p-5 gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[2rem] text-center"></TableHead>
              <TableHead className="w-[12rem]">Product Number</TableHead>
              <TableHead className="w-7/12">Name</TableHead>
              <TableHead className="w-[6rem] text-center">Quantity</TableHead>
              <TableHead className="w-[9rem] text-center">Type</TableHead>
              <TableHead className="w-[9rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !productsData
              ? Array.from({ length: 9 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="w-full h-14" />
                    </TableCell>
                  </TableRow>
                ))
              : productsData.products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center align-middle h-[43rem] text-primary/50 text-lg font-thin tracking-wide"
                    >
                      No products found for{' '}
                      {selectedType !== 'ALL'
                        ? `"${selectedType}"`
                        : 'the selected criteria'}
                      .
                    </TableCell>
                  </TableRow>
                ) : (
                  productsData.products.map((product) => {
                    const shortProductNo =
                      product.productNo.length > 14
                        ? product.productNo.slice(0, 14) + '...'
                        : product.productNo;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="text-center">
                          <div className="relative w-[3rem] h-[3rem] inline-block">
                            <Image
                              src={product.thumbnailURL}
                              alt={product.name}
                              fill
                              quality={75}
                              className="object-cover rounded-[0.1rem]"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="h-[4.3rem] flex items-center justify-between mr-4 gap-2">
                          {shortProductNo}
                          <Button
                            variant="none"
                            onClick={() =>
                              navigator.clipboard.writeText(product.productNo)
                            }
                            className="hover:opacity-75 duration-300 ease-in-out"
                          >
                            <Copy className="scale-100" />
                          </Button>
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
                            className={`py-1 w-full rounded font-bold ${
                              product.Type.name === 'UPPERWEAR'
                                ? 'bg-blue-500'
                                : product.Type.name === 'LOWERWEAR'
                                ? 'bg-teal-500'
                                : product.Type.name === 'FOOTWEAR'
                                ? 'bg-purple-500'
                                : product.Type.name === 'OUTERWEAR'
                                ? 'bg-cyan-500'
                                : 'bg-gray-300'
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
              {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {currentPage < productsData.totalPages && (
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
