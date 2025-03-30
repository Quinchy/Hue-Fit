// File: pages/dashboard/users/index.js
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Eye,
  Pencil,
  CircleMinus,
  ChevronDown,
  Search,
  NotepadText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const router = useRouter();

  const { data: usersData, isValidating } = useSWR(
    `/api/users/get-users?page=${currentPage}&search=${encodeURIComponent(
      searchTerm
    )}&role=${selectedRole !== "ALL" ? selectedRole : ""}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (usersData?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = (userNo, role, userId) => {
    router.push({
      pathname: routes.userView.replace("[userNo]", userNo),
      query: { role, userId },
    });
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Users</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search user"
            variant="icon"
            icon={Search}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                {["ALL", "ADMIN", "VENDOR", "CUSTOMER"].map((role) => (
                  <DropdownMenuItem
                    key={role}
                    className="justify-center"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <Button variant="none" className="text-base">
                      {role}
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link className={buttonVariants({ variant: "default" })} href={routes.userAdd}>
            <Plus className="scale-110 stroke-[3px]" />
            Create Admin
          </Link>
        </div>
      </div>

      <Card className="flex flex-col p-5 gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[5rem]">Picture</TableHead>
              <TableHead className="w-1/2">Name</TableHead>
              <TableHead className="w-1/2">Username/Email</TableHead>
              <TableHead className="min-w-[10rem] text-center">Role</TableHead>
              <TableHead className="w-[5rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!usersData ? (
              Array.from({ length: 12 }).map((_, idx) => (
                <TableRow key={idx}>
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
                </TableRow>
              ))
            ) : usersData.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-primary/50 text-lg font-thin tracking-wide"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              usersData.users.map((user) => {
                const profile =
                  user.Role.name === "ADMIN"
                    ? user.AdminProfile
                    : user.Role.name === "VENDOR"
                    ? user.VendorProfile
                    : user.CustomerProfile;
                const fullName = profile
                  ? `${profile.firstName} ${profile.lastName}`
                  : user.username;
                const picture =
                  profile && profile.profilePicture
                    ? profile.profilePicture
                    : "/images/placeholder-profile-picture.png";
                let roleBg = "bg-gray-300";
                if (user.Role.name === "ADMIN") roleBg = "bg-yellow-500";
                else if (user.Role.name === "VENDOR") roleBg = "bg-purple-500";
                else if (user.Role.name === "CUSTOMER") roleBg = "bg-sky-500";

                return (
                  <TableRow key={user.userNo}>
                    <TableCell>
                      <Image
                        src={picture}
                        alt="Profile"
                        width={45}
                        height={45}
                        className="rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{fullName}</TableCell>
                    <TableCell>
                      <div>{user.username}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <p
                        className={`py-1 w-full rounded font-bold text-card uppercase ${roleBg}`}
                      >
                        {user.Role.name}
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
                                className="text-base"
                                onClick={() =>
                                  handleViewClick(user.userNo, user.Role.name, user.userId)
                                }
                              >
                                <Eye className="scale-125" />
                                View
                              </Button>
                            </DropdownMenuItem>
                            {user.Role.name !== "ADMIN" && (
                              <>
                                <DropdownMenuItem className="justify-center">
                                  <Button
                                    variant="none"
                                    className="text-base"
                                    onClick={() =>
                                      router.push(
                                        routes.userEdit.replace("[userNo]", user.userNo) +
                                        `?userId=${user.userId}`
                                      )
                                    }
                                  >
                                    <Pencil className="scale-125" />
                                    Edit
                                  </Button>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="justify-center">
                                  <Button
                                    variant="none"
                                    className="font-bold text-base text-red-500"
                                  >
                                    <CircleMinus className="scale-125 stroke-red-500" />
                                    Suspend
                                  </Button>
                                </DropdownMenuItem>
                              </>
                            )}
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

        {usersData && usersData.users.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              {Array.from({ length: usersData.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < usersData.totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
