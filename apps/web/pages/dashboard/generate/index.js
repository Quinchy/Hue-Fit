import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Generate() {
  const [outfit, setOutfit] = useState(null); // To store the generated outfit

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const userFeatures = {
      height: parseFloat(formData.get("height")),
      weight: parseFloat(formData.get("weight")),
      skintone: formData.get("skintone"),
      bodyshape: formData.get("bodyshape"),
      age: parseInt(formData.get("age"), 10),
    };

    try {
      // Send data to the FastAPI endpoint
      const response = await fetch("http://localhost:8000/generate-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userFeatures),
      });

      if (response.ok) {
        const data = await response.json();
        setOutfit(data.outfit); // Update state with the generated outfit
      } else {
        console.error("Error generating outfit:", response.statusText);
      }
    } catch (error) {
      console.error("Error generating outfit:", error);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">Random Forest Outfit Generator - Tester</CardTitle>
      <div className="flex flex-row justify-between gap-20">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <CardTitle className="text-3xl">User Features</CardTitle>
          <Card>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label className="font-bold">Height</Label>
                <Input
                  placeholder="Enter the user's height"
                  name="height"
                  type="number"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-bold">Weight</Label>
                <Input
                  placeholder="Enter the user's weight"
                  name="weight"
                  type="number"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-bold">
                  Skin Tone (Fair, Light, Medium, Dark, Deep)
                </Label>
                <Input
                  placeholder="Enter the user's skin tone"
                  name="skintone"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-bold">
                  Body Shape (Pear, Apple, Rectangle, Triangle, Oval, Athletic)
                </Label>
                <Input
                  placeholder="Enter the user's body shape"
                  name="bodyshape"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-bold">Age</Label>
                <Input
                  placeholder="Enter the user's age"
                  name="age"
                  type="number"
                  required
                />
              </div>
              <Button type="submit">Generate Outfit</Button>
            </div>
          </Card>
        </form>
        <div className="w-full flex flex-col gap-5">
          <CardTitle className="text-3xl">Recommended Outfits</CardTitle>
          <div className="w-full flex flex-col gap-5">
            {outfit ? (
              <>
                <Card className="flex flex-col gap-1">
                  <CardTitle className="text-2xl">Upper Wear</CardTitle>
                  <div className="flex flex-row items-center gap-3">
                    <Label>Product Name:</Label>
                    <p>{outfit.upper_wear}</p>
                  </div>
                </Card>
                <Card className="flex flex-col gap-1">
                  <CardTitle className="text-2xl">Lower Wear</CardTitle>
                  <div className="flex flex-row items-center gap-3">
                    <Label>Product Name:</Label>
                    <p>{outfit.lower_wear}</p>
                  </div>
                </Card>
                <Card className="flex flex-col gap-1">
                  <CardTitle className="text-2xl">Footwear</CardTitle>
                  <div className="flex flex-row items-center gap-3">
                    <Label>Product Name:</Label>
                    <p>{outfit.footwear}</p>
                  </div>
                </Card>
              </>
            ) : (
              <p className="text-lg">No outfit generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}