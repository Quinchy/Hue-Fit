import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";

export default function AddMeasurementDialog({ buttonClassName = "", buttonName = "Add Measurement" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}><Plus/> {buttonName}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Measurement</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">Measurement Name <Asterisk className="w-4"/></Label>
            <Input id="name" placeholder="Enter a measurement name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="font-bold flex flex-row items-center">Assign to <Asterisk className="w-4"/></Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a clothing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="UPPERWEAR">UPPERWEAR</SelectItem>
                  <SelectItem value="LOWERWEAR">LOWERWEAR</SelectItem>
                  <SelectItem value="FOOTWEAR">FOOTWEAR</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Enter a description" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => console.log("Measurement Added")}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}