import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function AddColorDialog({ buttonClassName = "", buttonName = "Add Color" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}><Plus/> {buttonName}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Color</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input placeholder="Color Name" />
          <Input placeholder="Description" />
        </div>
        <DialogFooter>
          <Button onClick={() => console.log("Color Added")}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}