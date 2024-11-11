import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoveLeft } from 'lucide-react';
import routes from '@/routes';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import the role-specific form components
import AddAdminForm from '../components/add-admin-form';
import AddVendorForm from '../components/add-vendor-form';
import AddCustomerForm from '../components/add-customer-form';

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    role: '',
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setForm((prevForm) => ({ ...prevForm, role: value }));
  };

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back to Users Button */}
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-4xl">Add User</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          <MoveLeft className="scale-125" />
          Back to Users
        </Button>
      </div>
      <div className="flex gap-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-5">
          <div className="bg-accent rounded border-8 border-card">
            <Image src="/images/placeholder-profile-picture.png" alt="Profile" width={320} height={320} className='max-w-[30rem]' />
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="scale-110 stroke-[3px] mr-2" />
            Add Picture
          </Button>
        </div>

        {/* Form Section */}
        <div className="w-3/4 space-y-6 mb-20">
          {/* Role Information */}
          <Card className="p-4">
            <CardTitle className="text-2xl">Role Information</CardTitle>
            <Select
              name="role"
              value={form.role}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-full p-2 mt-2 border rounded">
                <SelectValue placeholder="Set a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="VENDOR">Vendor</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Conditional Form Rendering */}
          {form.role === "ADMIN" && (
            <AddAdminForm form={form} onChange={handleChange}/>
          )}
          {form.role === "VENDOR" && (
            <AddVendorForm form={form} onChange={handleChange}/>
          )}
          {form.role === "CUSTOMER" && (
            <AddCustomerForm form={form} onChange={handleChange}/>
          )}
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
