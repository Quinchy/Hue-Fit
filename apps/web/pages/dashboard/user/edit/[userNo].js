import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from '@/routes';
import { EyeOff } from 'lucide-react';

export default function EditUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    role: 'ADMIN',
    firstName: 'Carl Andrei',
    lastName: 'Tailorin',
    username: 'Shabu',
    password: '********'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSaveChanges = () => {
    // Update user logic here (e.g., API call)
    // After saving changes, navigate back to the Users page
    router.push(routes.user); // Redirect to the Users page
  };

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back to Users Button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl">Edit User</h1>
        {/* Back to Users Button styled as outline */}
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          ← Back to Users
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Profile Picture Section */}
        <div className="w-1/4 flex flex-col items-center">
          {/* Display Profile Picture */}
          <img src="/images/profile-picture.png" alt="Profile" className="h-24 w-24 rounded-full mb-4" />
          <Button variant="outline">+ Edit Picture</Button>
        </div>

        {/* Form Section */}
        <div className="w-3/4 space-y-6">
          {/* Role Information */}
          <Card className="p-4">
            <CardTitle>Role Information</CardTitle>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-2 mt-2 border rounded"
            >
              <option value="ADMIN">Admin</option>
              <option value="VENDOR">Vendor</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </Card>

          {/* Admin Information */}
          <Card className="p-4">
            <CardTitle>Admin Information</CardTitle>
            <div className="flex gap-4 mt-2">
              <input
                type="text"
                name="firstName"
                placeholder="Enter the admin's first name"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Enter the admin's last name"
                value={form.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </Card>

          {/* Admin Account */}
          <Card className="p-4">
            <CardTitle>Admin Account</CardTitle>
            <div className="flex gap-4 mt-2">
              <input
                type="text"
                name="username"
                placeholder="Create the admin's username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <div className="relative w-full">
                <input
                  type="password"
                  name="password"
                  placeholder="Create the admin's password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <EyeOff className="absolute top-3 right-3 text-gray-500 cursor-pointer" />
              </div>
            </div>
          </Card>

          {/* Save Changes Button */}
          <Button className="w-full mt-4" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
