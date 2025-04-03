// File: components/NavbarDashboard.js
import { signOut, useSession } from "next-auth/react";
import routes from "@/routes";
import HueFitLogo from "@/public/images/HueFitLogo";
import Link from "next/link";
import {
  House,
  Store,
  Shirt,
  Tag,
  User,
  LogOut,
  MessageSquareMore,
  Wrench,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const NavbarDashboard = () => {
  const { data: session, status } = useSession();
  // Use SWR to fetch fresh user info (including profile picture) from the API.
  // This ensures that if the database profile picture changes, the UI updates.
  const { data: userInfo } = useSWR("/api/users/get-user-info", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute; adjust as needed.
  });

  // Use session for basic info (like role) and userInfo for up-to-date profile picture & names.
  const userRole = session?.user?.role;
  const profilePicture =
    userInfo?.profilePicture ||
    "/images/profile-picture.png";
  const firstName = userInfo?.firstName || session?.user?.firstName || "";
  const lastName = userInfo?.lastName || session?.user?.lastName || "";

  const links = [
    {
      route: routes.dashboard,
      icon: <House className="scale-75" />,
      label: "Dashboard",
      roles: ["VENDOR", "ADMIN"],
    },
    {
      route: routes.shop,
      icon: <Store className="scale-75" />,
      label: "Shops",
      roles: ["ADMIN"],
    },
    {
      route: routes.user,
      icon: <User className="scale-75" />,
      label: "Users",
      roles: ["ADMIN"],
    },
    {
      route: routes.inquiry,
      icon: <MessageSquareMore className="scale-75" />,
      label: "Inquiries",
      roles: ["ADMIN"],
    },
    {
      route: routes.product,
      icon: <Shirt className="scale-75" />,
      label: "Products",
      roles: ["VENDOR"],
    },
    {
      route: routes.order,
      icon: <Tag className="scale-75" />,
      label: "Orders",
      roles: ["VENDOR"],
    },
    {
      route: routes.maintenance,
      icon: <Wrench className="scale-75" />,
      label: "Maintenance",
      roles: ["VENDOR"],
    },
  ];

  return (
    <div className="fixed flex flex-col justify-between items-center min-w-[15rem] border-r-[1px] border-border bg-card text-white h-full z-10 pt-5">
      <div className="flex flex-col items-center w-full space-y-5">
        <div className="flex flex-row justify-between w-full px-3">
          <Link href={routes.dashboard}>
            <HueFitLogo height={40} className="fill-primary" />
          </Link>
          <ModeToggle />
        </div>

        {userRole && (
          <div className="flex flex-col w-full items-center">
            {links
              .filter((link) => link.roles.includes(userRole))
              .map(({ route, icon, label }) => (
                <Link
                  key={route}
                  href={route}
                  className="text-sm py-2 w-full hover:bg-accent duration-500 ease-in-out select-none"
                >
                  <div className="pl-5 flex flex-row items-center gap-2 text-primary uppercase">
                    {icon}
                    {label}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="w-full focus-visible:outline-none">
          <div className="flex flex-row justify-start items-center gap-3 py-7 w-full hover:bg-accent duration-300 ease-in-out">
            {status === "loading" ? (
              <div className="flex flex-row pl-10 items-center gap-3">
                <Skeleton className="rounded-full w-12 h-12" />
                <div className="flex flex-col items-start gap-1 text-primary">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ) : !session ? (
              <div className="flex flex-row pl-5 items-center gap-2">
                <Image
                  src="/images/profile-picture.png"
                  width={35}
                  height={35}
                  className="rounded-full select-none"
                  alt="Profile Picture"
                />
                <div className="flex flex-col items-start text-sm text-primary select-none">
                  <p className="font-semibold">Guest</p>
                  <p className="font-light">Not Logged In</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-row pl-5 items-center gap-2">
                <Image
                  src={profilePicture}
                  width={35}
                  height={35}
                  className="rounded-full select-none"
                  alt="Profile Picture"
                />
                <div className="flex flex-col items-start text-[0.80rem] text-primary select-none">
                  <p className="font-semibold">
                    {firstName} {lastName}
                  </p>
                  <p className="font-light">{userRole}</p>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[15rem] rounded-none">
          <DropdownMenuLabel className="uppercase">
            Your Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={routes.profile}
              className="flex justify-start items-center gap-1 text-sm font-medium rounded w-full uppercase"
            >
              <User className="scale-75" /> Profile
            </Link>
          </DropdownMenuItem>
          {userRole === "VENDOR" && (
            <DropdownMenuItem>
              <Link
                href={routes.shopProfile}
                className="flex justify-start items-center gap-1 text-sm font-medium rounded w-full uppercase"
              >
                <Store className="scale-75" /> Shop
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="focus:bg-red-500/25">
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
              className="flex justify-start items-center gap-1 text-sm font-medium rounded w-full uppercase text-warning"
            >
              <LogOut className="scale-75" /> Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarDashboard;
