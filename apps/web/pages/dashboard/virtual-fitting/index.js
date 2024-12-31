import DashboardLayoutWrapper from '@/components/ui/dashboard-layout';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import routes from '@/routes';

export default function VirtualFiting() {
  
  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Virtual Fitting</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search product variants"
            variant="icon"
            icon={Search}
          />
          <Link className={buttonVariants({ variant: 'default' })} href={routes.addVirtualFitting}>
            <Plus className="scale-110 stroke-[3px]" />
            Add Virtual Fitting
          </Link>
        </div>
      </div>
    </DashboardLayoutWrapper>
  )
}