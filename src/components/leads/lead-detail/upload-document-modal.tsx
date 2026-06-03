import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadDocument } from "@/components/application/hook/mutation/use-upload-document";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UploadDocumentModal({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("marks_card_10");
  const { mutate: uploadDocument, isPending } = useUploadDocument();

  const handleUpload = () => {
    if (!file) return;
    uploadDocument(
      { file, applicationId, documentType },
      {
        onSuccess: () => {
          setOpen(false);
          setFile(null);
          setDocumentType("marks_card_10");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="size-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marks_card_10">10th Marks Card</SelectItem>
                <SelectItem value="marks_card_12">12th Marks Card</SelectItem>
                <SelectItem value="degree_certificate">Degree Certificate</SelectItem>
                <SelectItem value="identity_proof">Identity Proof</SelectItem>
                <SelectItem value="address_proof">Address Proof</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>File</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById("file-upload")?.click()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")) {
                    setFile(droppedFile);
                  } else {
                    alert("Only PDF files are allowed.");
                  }
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
                      setFile(selectedFile);
                    } else {
                      alert("Only PDF files are allowed.");
                    }
                  } else {
                    setFile(null);
                  }
                }}
              />
              <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                <Upload className="size-5" />
              </div>
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Click or drag file to this area to upload
                  </p>
                  <p className="text-xs text-muted-foreground">Supported format: PDF only</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isPending} loading={isPending}>
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
