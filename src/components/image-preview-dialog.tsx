/* eslint-disable @next/next/no-img-element */
// components/image-preview-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImagePreviewDialog = ({ isOpen, onClose, imageUrl, title }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title || "Image Preview"}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full max-h-[80vh] overflow-hidden rounded-lg">
          <img 
            src={imageUrl} 
            alt={title || "Preview"}
            className="w-full h-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;