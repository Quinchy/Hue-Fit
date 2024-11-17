// nav-bar-dashboard.js

import { signOut, useSession } from "next-auth/react";
import routes from '@/routes';
import HueFitLogo from '@/public/images/HueFitLogo';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { House, Store, Shirt, Tag, User, Settings, LogOut, MessageSquareMore } from 'lucide-react';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/providers/permission-provider";

const NavbarDashboard = () => {
  const { data: session } = useSession();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    role: "",
    profilePicture: "/images/profile-picture.png",
  });
  const [loading, setLoading] = useState(true);

  // Mapping from page label to pageId
  const pageIdMapping = {
    shop: 1,
    inquiry: 2,
    user: 3,
    settings: 4,
    product: 5,
    order: 6,
  };

  const links = [
    { route: routes.dashboard, icon: <House />, label: "Dashboard", pageId: "dashboard" },
    { route: routes.shop, icon: <Store />, label: "Shops", pageId: "shop" },
    { route: routes.product, icon: <Shirt />, label: "Products", pageId: "product" },
    { route: routes.order, icon: <Tag />, label: "Orders", pageId: "order" },
    { route: routes.user, icon: <User />, label: "Users", pageId: "user" },
    { route: routes.inquiry, icon: <MessageSquareMore />, label: "Inquiries", pageId: "inquiry" },
    { route: routes.settings, icon: <Settings />, label: "Settings", pageId: "settings" },
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!session?.user?.userNo) return;

        // Check if user data is in localStorage
        const cachedUserInfo = localStorage.getItem(`userInfo-${session.user.userNo}`);
        if (cachedUserInfo) {
          setUserInfo(JSON.parse(cachedUserInfo));
          setLoading(false);
        } else {
          const response = await fetch(`/api/users/view/${session.user.userNo}`);
          if (response.ok) {
            const data = await response.json();
            const userData = {
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              profilePicture: data.profilePicture || "/images/profile-picture.png",
            };
            setUserInfo(userData);
            setLoading(false);
            // Cache user data in localStorage
            localStorage.setItem(`userInfo-${session.user.userNo}`, JSON.stringify(userData));
          } else {
            console.error("Failed to fetch user data");
          }
        }
      } catch (error) {
        console.error("An error occurred while fetching user data:", error);
      }
    };

    fetchUserInfo();
  }, [session?.user?.userNo]);

  // Check if the user has the required permission for a specific page
  const hasPermission = (pageId) => {
    const pageIntegerId = pageIdMapping[pageId]; // Convert to integer pageId
    return permissions?.some(perm => perm.pageId === pageIntegerId && perm.can_view);
  };

  return (
    <div className="fixed flex flex-col justify-between items-center min-w-[20rem] border-r-[1px] border-border bg-card text-white h-full z-10 pt-5">
      {/* Group Logo and Links */}
      <div className="flex flex-col items-center w-full space-y-5">
        <div className="flex flex-row justify-between w-full px-9">
          <Link href={routes.dashboard} className="mb-3">
            <HueFitLogo height={50} className="fill-primary" />
          </Link>
          <ModeToggle />
        </div>

        <div className="flex flex-col w-full items-center">
          {(loading || permissionsLoading) ? (
            // Display skeleton placeholders for links if loading
            Array.from({ length: links.length }).map((_, index) => (
              <div key={index} className="flex flex-row justify-start items-center gap-3 py-3 w-full">
                <Skeleton className="ml-10 w-[180px] h-6" />
              </div>
            ))
          ) : (
            // Render actual links when loading is complete
            links.map(({ route, icon, label, pageId }) => (
              (pageId === "dashboard" || hasPermission(pageId)) && (
                <Link key={route} href={route} className="flex flex-row justify-start items-center gap-3 py-3 w-full hover:bg-accent duration-300 ease-in-out">
                  <div className="pl-10 flex flex-row items-center gap-3 text-primary uppercase">
                    {icon}
                    {label}
                  </div>
                </Link>
              )
            ))
          )}
        </div>
      </div>

      {/* Profile and Logout Section */}
      <DropdownMenu className="mt-auto">
        <DropdownMenuTrigger className="w-full focus-visible:outline-none">
          <div className="flex flex-row justify-start items-center gap-3 py-7 w-full hover:bg-accent duration-300 ease-in-out">
            {loading || permissionsLoading ? (
              // Show skeleton if loading
              <div className="flex flex-row pl-10 items-center gap-3">
                <Skeleton className="rounded-full w-12 h-12" />
                <div className="flex flex-col items-start gap-1 text-primary">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ) : (
              // Show actual data when loading is complete
              <div className="flex flex-row pl-10 items-center gap-3">
                <Image src={userInfo.profilePicture} width={50} height={50} className="rounded-full border-2 border-background/75" alt="Profile Picture" />
                <div className="flex flex-col items-start gap-0 text-primary">
                  <p className="font-semibold">{userInfo.firstName} {userInfo.lastName}</p>
                  <p className="font-light">{userInfo.role}</p>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[18rem]">
          <DropdownMenuLabel className="uppercase">Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={routes.userView} className="flex justify-start items-center gap-1 font-semibold py-2 px-4 rounded w-full uppercase">
              <User className="stroke-primary" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
          <button
            onClick={() => {
              // Clear localStorage and sessionStorage
              localStorage.clear();
              sessionStorage.clear();

              // Trigger signOut and redirect to the home page
              signOut({ callbackUrl: '/' });
            }}
            className="flex items-center gap-1 justify-start shadow-none text-red-500 font-semibold py-2 px-4 rounded w-full uppercase"
          >
            <LogOut /> Logout
          </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarDashboard;
