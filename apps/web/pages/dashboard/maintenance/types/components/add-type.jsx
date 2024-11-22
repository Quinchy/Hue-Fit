import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AddTypeDialog({ buttonClassName = "", buttonName = "Add Type" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}><Plus/> {buttonName}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Type</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">Type Name <Asterisk className="w-4"/></Label>
            <Input id="name" placeholder="Enter a type name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Enter a description" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => console.log("Type Added")}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}