// AddVendorForm.js
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectValue, SelectLabel } from "@/components/ui/select";

export default function AddVendorForm() {
  return (
    <Card className="p-6">
      <CardTitle className="text-2xl mb-4">Role Information</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Shop</Label>
          <Select>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="shop1">Shop 1</SelectItem>
                <SelectItem value="shop2">Shop 2</SelectItem>
                <SelectItem value="shop3">Shop 3</SelectItem>
                <SelectItem value="shop4">Shop 4</SelectItem>
                <SelectItem value="shop5">Shop 5</SelectItem>
                <SelectItem value="shop6">Shop 6</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardTitle className="text-2xl my-6">Vendor Information</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input placeholder="Enter the vendor's first name" />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input placeholder="Enter the vendor's last name" />
        </div>
        <div>
          <Label>Contact Number</Label>
          <Input placeholder="Enter the vendor's contact number" />
        </div>
        <div>
          <Label>Email</Label>
          <Input placeholder="Enter the vendor's email" />
        </div>
        <div className="col-span-2">
          <Label>Position</Label>
          <Input placeholder="Enter the vendor's position" />
        </div>
      </div>
      <CardTitle className="text-2xl my-6">Create the Vendor Account</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <Input placeholder="Create the vendor's username" />
        </div>
        <div>
          <Label>Password</Label>
          <Input placeholder="Create the vendor's password" type="password" />
        </div>
      </div>
      <Button className="mt-6 w-full">Submit</Button>
    </Card>
  );
}
