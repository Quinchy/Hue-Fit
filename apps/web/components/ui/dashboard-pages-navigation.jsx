// File: DashboardPagesNavigation.js
import Link from "next/link";
import { useRouter } from "next/router";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardPagesNavigation({ items }) {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4">
      {items.map(({ label, href }) => {
        const isActive = router.asPath === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${buttonVariants({ variant: "ghost" })} px-10 py-5 uppercase rounded-none text-lg font-semibold ${
              isActive ? "border-b-2 border-primary" : ""
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
