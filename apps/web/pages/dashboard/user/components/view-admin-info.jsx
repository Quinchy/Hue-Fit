// components/ViewAdminInfo.js
import { Card, CardTitle } from "@/components/ui/card";

export default function ViewAdminInfo({ user }) {
  return (
    <Card className="p-6 shadow-md w-full">
      <CardTitle className="text-xl font-semibold mb-4">Admin Information</CardTitle>
      <div className="space-y-3">
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Date Created:</strong> {user.dateCreated}</p>
      </div>
    </Card>
  );
}
