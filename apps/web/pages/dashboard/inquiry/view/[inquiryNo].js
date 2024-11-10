import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import routes from '@/routes';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Search } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { NotepadText } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button"

export default function ViewInquiry() {
  return (
    <DashboardLayoutWrapper>
      {/* Header with Back Button */}
      <div className="flex flex-row justify-between items-center mb-5">
        <CardTitle className="text-4xl">Inquiry Detail</CardTitle>
        <Button variant="outline" className="text-lg font-medium bg-black text-white px-4 py-2">
          <Link href={routes.inquiry}>
            &larr; Back to Inquiries
          </Link>
        </Button>
      </div>

      {/* Inquiry Detail Card */}
      <Card className="p-6 rounded-lg shadow-md">
        <div className="text-lg font-semibold mb-3">
          Email: carlandrei.tallorin@gmail.com
        </div>
        <div className="mb-2">
          <strong>Subject:</strong> Unlock New Potential
        </div>
        <div className="mb-2">
          <strong>Message:</strong> ChaCharmie Men's Apparel offers a stylish selection of men's clothing, combining modern designs with quality craftsmanship. Whether you're looking for casual wear, business attire, or trendy accessories, ChaCharmie provides versatile options that cater to every occasion. Stay sharp, comfortable, and on-trend with our curated collections.
        </div>
        <div className="mt-2">
          <strong>Date:</strong> October 14, 2024
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
