import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import the Skeleton component
import { useState } from "react";
import { Loader } from "lucide-react";

export default function Generate() {
  const [outfit, setOutfit] = useState(null); // To store the generated outfit
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return; // Prevent duplicate calls if already loading
    setLoading(true); // Set loading to true when fetching starts

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
      const response = await fetch(`https://hue-fit-ai.onrender.com/generate-outfit?unique=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Connection": "close",
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
    } finally {
      setLoading(false); // Set loading to false when fetching is complete
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
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" width={20} />
                    Generating Outfit...
                  </>
                ) : (
                  "Generate Outfit"
                )}
              </Button>
            </div>
          </Card>
        </form>
        <div className="w-full flex flex-col gap-5">
          <CardTitle className="text-3xl">Recommended Outfits</CardTitle>
          <div className="w-full flex flex-col gap-5">
            {loading ? (
              <>
                {/* Skeletons for loading */}
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <Skeleton className="w-3/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/2 h-8 rounded-lg" />
                </Card>
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <Skeleton className="w-3/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/2 h-8 rounded-lg" />
                </Card>
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <Skeleton className="w-3/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/2 h-8 rounded-lg" />
                </Card>
              </>
            ) : outfit ? (
              <>
                {/* Upper Wear */}
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <img
                    src={outfit.upper_wear.thumbnail}
                    alt={outfit.upper_wear.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <CardTitle className="text-2xl">{outfit.upper_wear.name}</CardTitle>
                  <p className="text-lg font-bold">
                    Price: ₱{outfit.upper_wear.price.toFixed(2)}
                  </p>
                  <Button
                    as="a"
                    href={`/product/${outfit.upper_wear.productVariantNo}`}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </Card>

                {/* Lower Wear */}
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <img
                    src={outfit.lower_wear.thumbnail}
                    alt={outfit.lower_wear.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <CardTitle className="text-2xl">{outfit.lower_wear.name}</CardTitle>
                  <p className="text-lg font-bold">
                    Price: ₱{outfit.lower_wear.price.toFixed(2)}
                  </p>
                  <Button
                    as="a"
                    href={`/product/${outfit.lower_wear.productVariantNo}`}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </Card>

                {/* Footwear */}
                <Card className="flex flex-col items-center gap-5 p-5 shadow-lg">
                  <img
                    src={outfit.footwear.thumbnail}
                    alt={outfit.footwear.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <CardTitle className="text-2xl">{outfit.footwear.name}</CardTitle>
                  <p className="text-lg font-bold">
                    Price: ₱{outfit.footwear.price.toFixed(2)}
                  </p>
                  <Button
                    as="a"
                    href={`/product/${outfit.footwear.productVariantNo}`}
                    className="w-full"
                  >
                    View Details
                  </Button>
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
