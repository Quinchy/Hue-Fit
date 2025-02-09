// components/ViewCustomerInfo.js
import { Card, CardTitle } from "@/components/ui/card";

export default function ViewCustomerInfo({ user = {} }) {
  return (
    <Card className="flex flex-col p-5 gap-5 shadow-md w-full">
      <CardTitle className="text-xl font-semibold">Customer Information</CardTitle>
      <div className="space-y-1">
        <p className="font-thin">
          <strong>User No:</strong> {user.userNo || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Username:</strong> {user.username || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Role:</strong> {user.role || "N/A"}
        </p>
        <p className="font-thin">
          <strong>First Name:</strong> {user.firstName || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Last Name:</strong> {user.lastName || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Email:</strong> {user.email || "N/A"}
        </p>
        <div className="font-thin">
          <strong>Addresses:</strong>{" "}
          {user.addresses && user.addresses.length > 0 ? (
            <ul className="list-disc list-inside">
              {user.addresses.map((addr, index) => (
                <li key={index}>
                  {addr.buildingNo ? addr.buildingNo + ", " : ""}
                  {addr.street ? addr.street + ", " : ""}
                  {addr.barangay ? addr.barangay + ", " : ""}
                  {addr.municipality ? addr.municipality + ", " : ""}
                  {addr.province ? addr.province + ", " : ""}
                  {addr.postalCode || ""}
                </li>
              ))}
            </ul>
          ) : (
            "N/A"
          )}
        </div>
      </div>
      <div>
        <CardTitle className="text-xl font-semibold mb-4">Customer Features</CardTitle>{" "}
        {user.features && user.features.length > 0 ? (
          <ul className="list-disc list-inside">
            {user.features.map((feat, index) => (
              <div className="space-y-1" key={index}>
                <p className="font-thin"> <strong>Height:</strong> {feat.height} </p>
                <p className="font-thin"> <strong>Weight:</strong> {feat.weight} </p>
                <p className="font-thin"> <strong>Age:</strong> {feat.age} </p>
                <p className="font-thin"> <strong>Skintone:</strong> {feat.skintone} </p>
                <p className="font-thin"> <strong>Body Shape:</strong> {feat.bodyShape} </p>
              </div>
            ))}
          </ul>
        ) : (
          "N/A"
        )}
      </div>
    </Card>
  );
}
