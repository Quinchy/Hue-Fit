import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from '@/routes';
import { Plus, Eye, Pencil, Trash2, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(2); // Set total pages manually for mock data
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const users = [
    { id: 1, name: "Carl Andrei Tailorin", username: "shabu", email: "carlandrei.tailorin@gmail.com", role: "ADMIN" },
    { id: 2, name: "Hendrix Lapuz", username: "DrixLPZ", email: "drix.lpz015@gmail.com", role: "ADMIN" },
    { id: 3, name: "Andrei Daproza", username: "Drei", email: "misterD@gmail.com", role: "VENDOR" },
    { id: 4, name: "Kevin Louise Legaspi", username: "katshuhira", email: "katshuhira@gmail.com", role: "VENDOR" },
    { id: 5, name: "Xein Deinel Virgines", username: "xeinden", email: "xeindenlilvirgines@gmail.com", role: "CUSTOMER" },
    { id: 6, name: "Samuel Cruz", username: "ramettime", email: "samuel.cruz123@gmail.com", role: "CUSTOMER" },
    { id: 7, name: "Ernest Rhodier De Leon", username: "meschz", email: "ernest.rh.deleon@gmail.com", role: "ADMIN" },
  ];

  // Function to handle adding a new user, navigating to the add user page
  const handleAddUserClick = () => {
    router.push(routes.userAdd.replace("[userNo]", "new")); // Navigates to /dashboard/user/add/new
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Users</CardTitle>
        {/* Add New Button styled similar to Add Product button */}
        <Button onClick={handleAddUserClick}>
          <Plus className="scale-110 stroke-[3px]" />
          Add New
        </Button>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Picture</TableHead>
              <TableHead className="max-w-[3rem]">Name</TableHead>
              <TableHead className="max-w-[5rem]">Username/Email</TableHead>
              <TableHead className="max-w-[1rem] text-center">Role</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-[1rem]">
                    <img src="/path/to/default-profile.png" alt="Profile" className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell className="max-w-[3rem] font-medium">{user.name}</TableCell>
                  <TableCell className="max-w-[5rem]">
                    <div>{user.username}</div>
                    <div className="text-gray-500">{user.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[1rem] text-center">
                    <span className={`px-3 py-1 rounded-full text-white ${user.role === 'ADMIN' ? 'bg-purple-500' : user.role === 'VENDOR' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                      {user.role}
                    </span>
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
                            <Button variant="none" className="text-base" onClick={() => router.push(routes.userView.replace("[userNo]", user.id))}>
                              <Eye className="scale-125"/>
                              View
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="justify-center">
                            <Button variant="none" className="text-base" onClick={() => router.push(routes.userEdit.replace("[userNo]", user.id))}>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-5">
                  There are no users yet.
                </TableCell>
              </TableRow>
            )}           
          </TableBody>
        </Table>
        <Pagination className="flex flex-col items-end">
          <PaginationContent>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page} active={page === currentPage}>
                <PaginationLink onClick={() => handlePageChange(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
