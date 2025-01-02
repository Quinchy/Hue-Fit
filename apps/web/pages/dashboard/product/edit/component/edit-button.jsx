// EditButton.jsx
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";

export default function EditButton({ isEditing, onEdit, onSave, onCancel }) {
  if (isEditing) {
    return (
      <div className="flex flex-row gap-2">
        <Button variant="default" type="button" onClick={onSave}>
          <Save className="mr-2" /> Save
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="mr-2" /> Cancel
        </Button>
      </div>
    );
  }
  return (
    <Button variant="outline" type="button" onClick={onEdit}>
      <Pencil className="mr-2" /> Edit
    </Button>
  );
}
