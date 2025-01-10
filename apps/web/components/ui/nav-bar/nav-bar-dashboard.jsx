// nav-bar-dashboard.jsx

import { signOut, useSession } from "next-auth/react";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { House, Store, Shirt, Tag, User, Settings, LogOut, MessageSquareMore, Wrench, Camera } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const NavbarDashboard = () => {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const links = [
    { route: routes.dashboard, icon: <House />, label: "Dashboard", roles: ["VENDOR", "ADMIN"] },
    { route: routes.shop, icon: <Store />, label: "Shops", roles: ["ADMIN"] },
    { route: routes.user, icon: <User />, label: "Users", roles: ["ADMIN"] },
    { route: routes.inquiry, icon: <MessageSquareMore />, label: "Inquiries", roles: ["ADMIN"] },
    { route: routes.settings, icon: <Settings />, label: "Settings", roles: ["ADMIN"] },
    { route: routes.product, icon: <Shirt />, label: "Products", roles: ["VENDOR"] },
    { route: routes.order, icon: <Tag />, label: "Orders", roles: ["VENDOR"] },
    { route: routes.maintenance, icon: <Wrench />, label: "Maintenance", roles: ["VENDOR"] },
    { route: routes.virtualFitting, icon: <Camera />, label: "Virtual Fitting", roles: ["VENDOR"] },
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      try {
        const response = await fetch("/api/users/get-user-info", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        setUserInfo({
          firstName: data.firstName || "First",
          lastName: data.lastName || "Last",
          role: data.role || "VENDOR",
          profilePicture: data.profilePicture || "/images/profile-picture.png",
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [session?.user?.id]);

  return (
    <div className="fixed flex flex-col justify-between items-center min-w-[20rem] border-r-[1px] border-border bg-card text-white h-full z-10 pt-5">
      <div className="flex flex-col items-center w-full space-y-5">
        <div className="flex flex-row justify-between w-full px-9">
          <Link href={routes.dashboard} className="mb-3">
            <HueFitLogo height={50} className="fill-primary" />
          </Link>
          <ModeToggle />
        </div>

        <div className="flex flex-col w-full items-center">
          {links
            .filter((link) => link.roles.includes(userInfo?.role || "VENDOR"))
            .map(({ route, icon, label }) => (
              <Link
                key={route}
                href={route}
                className="flex flex-row justify-start items-center gap-3 py-3 w-full hover:bg-accent duration-300 ease-in-out"
              >
                <div className="pl-10 flex flex-row items-center gap-3 text-primary uppercase">
                  {icon}
                  {label}
                </div>
              </Link>
            ))}
        </div>
      </div>

      <DropdownMenu className="mt-auto">
        <DropdownMenuTrigger className="w-full focus-visible:outline-none">
          <div className="flex flex-row justify-start items-center gap-3 py-7 w-full hover:bg-accent duration-300 ease-in-out">
            {loading ? (
              <div className="flex flex-row pl-10 items-center gap-3">
                <Skeleton className="rounded-full w-12 h-12" />
                <div className="flex flex-col items-start gap-1 text-primary">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ) : (
              <div className="flex flex-row pl-10 items-center gap-3">
                <Image
                  src={userInfo?.profilePicture}
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-background/75"
                  alt="Profile Picture"
                />
                <div className="flex flex-col items-start gap-0 text-primary">
                  <p className="font-semibold">
                    {userInfo?.firstName} {userInfo?.lastName}
                  </p>
                  <p className="font-light">{userInfo?.role}</p>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[18rem]">
          <DropdownMenuLabel className="uppercase">Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={routes.profile}
              className="flex justify-start items-center gap-1 font-semibold py-2 px-4 rounded w-full uppercase"
            >
              <User className="stroke-primary" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
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
