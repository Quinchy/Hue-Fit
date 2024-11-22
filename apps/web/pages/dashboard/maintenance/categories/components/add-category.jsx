import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AddCategoryDialog({ buttonClassName = "", buttonName = "Add Category" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}><Plus/> {buttonName}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">Category Name <Asterisk className="w-4"/></Label>
            <Input id="name" placeholder="Enter a category name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Enter a description" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => console.log("Category Added")}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}