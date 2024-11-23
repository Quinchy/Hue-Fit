// pages/dashboard/maintenance/tags/components/add-tag.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function AddTagDialog({ buttonClassName = "", buttonName = "Add Tag", onTagAdded }) {
  const [tagName, setTagName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState([]); // Ensure types is always an array
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State to control dialog visibility

  // Fetch types for assignment
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/maintenance/types/get-types");
        if (response.ok) {
          const data = await response.json();
          setTypes(Array.isArray(data.types) ? data.types : []); // Ensure types is an array
        } else {
          console.error("Failed to fetch types");
          setTypes([]); // Fallback to empty array on failure
        }
      } catch (error) {
        console.error("Error fetching types:", error);
        setTypes([]); // Fallback to empty array on error
      }
    };

    fetchTypes();
  }, []);

  const handleAddTag = async () => {
    if (!tagName.trim()) {
      alert("Tag name cannot be empty!");
      return;
    }
    if (!typeId) {
      alert("Please select a type!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/maintenance/tags/add-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tagName, typeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        setLoading(false);
        return;
      }

      const { tag } = await response.json();
      alert("Tag added successfully!");

      // Notify parent to update the tag list
      if (onTagAdded) onTagAdded(tag);

      // Close the dialog and reset form
      setTagName("");
      setTypeId("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add tag:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Tag Name Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">
              Tag Name <Asterisk className="w-4" />
            </Label>
            <Input
              id="name"
              placeholder="Enter a tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Assign To Dropdown */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="type" className="font-bold flex flex-row items-center">
              Assign to <Asterisk className="w-4" />
            </Label>
            <Select value={typeId} onValueChange={(value) => setTypeId(value)}>
              <SelectTrigger id="type" disabled={loading}>
                <SelectValue placeholder="Select a clothing type" />
              </SelectTrigger>
              <SelectContent>
                {types.length > 0 ? (
                  types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No types available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddTag} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
