// AddCustomerForm.js
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AddCustomerForm() {
  return (
    <Card className="p-6">
      <CardTitle className="text-2xl mb-4">Customer Information</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input placeholder="Enter the customer's first name" />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input placeholder="Enter the customer's last name" />
        </div>
        <div className="col-span-2">
          <Label>Email</Label>
          <Input placeholder="Enter the customer's email" />
        </div>
      </div>
      <CardTitle className="text-2xl my-6">Create the Customer Account</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <Input placeholder="Create the customer's username" />
        </div>
        <div>
          <Label>Password</Label>
          <Input placeholder="Create the customer's password" type="password" />
        </div>
      </div>
      <Button className="mt-6 w-full">Submit</Button>
    </Card>
  );
}
