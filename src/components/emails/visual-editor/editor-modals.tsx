import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EditorModalsProps {
  linkModalOpen: boolean;
  setLinkModalOpen: (val: boolean) => void;
  linkUrl: string;
  setLinkUrl: (val: string) => void;
  handleInsertLink: () => void;
  videoModalOpen: boolean;
  setVideoModalOpen: (val: boolean) => void;
  videoSourceType: "url" | "file";
  setVideoSourceType: (val: "url" | "file") => void;
  videoUrl: string;
  setVideoUrl: (val: string) => void;
  videoProvider: "so" | "yt" | "vi";
  setVideoProvider: (val: "so" | "yt" | "vi") => void;
  handleSaveVideo: () => void;
  tableModalOpen: boolean;
  setTableModalOpen: (val: boolean) => void;
  tableRows: number;
  setTableRows: (val: number) => void;
  tableCols: number;
  setTableCols: (val: number) => void;
  tableHasHeader: boolean;
  setTableHasHeader: (val: boolean) => void;
  handleInsertTable: () => void;
  handleCancelTable: () => void;
}

export function EditorModals({
  linkModalOpen,
  setLinkModalOpen,
  linkUrl,
  setLinkUrl,
  handleInsertLink,
  videoModalOpen,
  setVideoModalOpen,
  videoSourceType,
  setVideoSourceType,
  videoUrl,
  setVideoUrl,
  videoProvider,
  setVideoProvider,
  handleSaveVideo,
  tableModalOpen,
  setTableModalOpen,
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
  tableHasHeader,
  setTableHasHeader,
  handleInsertTable,
  handleCancelTable,
}: EditorModalsProps) {
  return (
    <>
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the link. The selected text will become clickable.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="url"
                className="text-right text-xs font-semibold text-muted-foreground"
              >
                URL
              </label>
              <Input
                id="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="col-span-3 h-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Video Settings</DialogTitle>
            <DialogDescription>Configure the source for the video component.</DialogDescription>
          </DialogHeader>
          <Tabs
            value={videoSourceType}
            onValueChange={(v: any) => setVideoSourceType(v)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Web URL</TabsTrigger>
              <TabsTrigger value="file">Upload Local Video</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4 py-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Video URL / YouTube / Vimeo Link
                </label>
                <Input
                  value={videoUrl.startsWith("data:video/") ? "" : videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or MP4 URL"
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Provider</label>
                <select
                  value={videoProvider}
                  onChange={(e: any) => setVideoProvider(e.target.value)}
                  className="h-9 w-full px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground/80 outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="so">HTML5 Video / Source URL</option>
                  <option value="yt">YouTube</option>
                  <option value="vi">Vimeo</option>
                </select>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/20 hover:bg-muted/30 transition relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 15 * 1024 * 1024) {
                        toast.error(
                          "Video file is too large (max 15MB). Please host it online and paste the URL instead.",
                        );
                        return;
                      }
                      toast.info("Processing video file...");
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Data = event.target?.result as string;
                        setVideoUrl(base64Data);
                        setVideoProvider("so");
                        toast.success("Local video file loaded successfully!");
                      };
                      reader.onerror = () => {
                        toast.error("Failed to read video file.");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-center pointer-events-none">
                  <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Click to upload video
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    MP4, WebM, or OGG (Max 15MB)
                  </span>
                </div>
              </div>
              {videoUrl.startsWith("data:video/") && (
                <div className="text-[11px] font-semibold text-success flex items-center gap-1">
                  ✓ Local video file attached successfully
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setVideoModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo} disabled={!videoUrl.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tableModalOpen} onOpenChange={(val) => { if (!val) handleCancelTable(); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
            <DialogDescription>
              Specify the dimensions and format for your email table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="table-cols" className="text-xs font-semibold text-muted-foreground">
                Columns (max 8)
              </label>
              <Input
                id="table-cols"
                type="number"
                min={1}
                max={8}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="table-rows" className="text-xs font-semibold text-muted-foreground">
                Rows (max 100)
              </label>
              <Input
                id="table-rows"
                type="number"
                min={1}
                max={100}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="table-header"
                type="checkbox"
                checked={tableHasHeader}
                onChange={(e) => setTableHasHeader(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="table-header" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                Include Header Row
              </label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancelTable}>
              Cancel
            </Button>
            <Button onClick={handleInsertTable}>
              Insert Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
