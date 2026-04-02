import { useCallback, useRef, useState } from "react";
import { Upload, Link2, Loader2 } from "lucide-react";
import { uploadSiteImage } from "@/lib/storage-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  helperText?: string;
  className?: string;
};

export function ImageUploadField({ label, value, onChange, disabled, helperText, className }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const { publicUrl } = await uploadSiteImage(file);
        onChange(publicUrl);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || uploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "relative flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        )}
        <p className="text-sm text-center text-muted-foreground">
          Drag and drop an image here, or{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-2"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            browse
          </button>
        </p>
      </div>

      {value ? (
        <div className="rounded-md border bg-card p-2">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <img src={value} alt="" className="max-h-40 w-full object-contain rounded" />
        </div>
      ) : null}

      <Button type="button" variant="ghost" size="sm" className="gap-1 px-0 h-auto" onClick={() => setShowUrl((s) => !s)} disabled={disabled}>
        <Link2 className="h-3.5 w-3.5" />
        {showUrl ? "Hide URL field" : "Or paste image URL"}
      </Button>
      {showUrl ? (
        <Input disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      ) : null}
    </div>
  );
}
