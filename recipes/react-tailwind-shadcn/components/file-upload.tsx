"use client";

import * as React from "react";
import { CircleAlertIcon, FileIcon, UploadIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FileUploadProps = {
  /** Controlled list of chosen files. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** What to upload, e.g. "Drop your logo here, or browse". */
  prompt: string;
  /** Constraints in plain words, e.g. "PNG or SVG, up to 2 MB". */
  hint: string;
  /** Passed to the input, e.g. "image/png,image/svg+xml". */
  accept?: string;
  multiple?: boolean;
  /** Per-file limit in bytes. Files over it are rejected with a message. */
  maxSize?: number;
  /** External error, e.g. a failed upload. Size errors are raised internally. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Replaces the bare "Choose file / No file chosen" control. The real
 * <input type="file"> stays in the DOM (visually hidden) so keyboard,
 * screen readers and form submission keep working; the label is the dropzone.
 */
function FileUpload({
  files,
  onFilesChange,
  prompt,
  hint,
  accept,
  multiple = false,
  maxSize,
  error,
  disabled,
  id,
  className,
}: FileUploadProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [sizeError, setSizeError] = React.useState<string>();
  const message = error ?? sizeError;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || disabled) return;
    const list = Array.from(incoming);
    const tooLarge = maxSize ? list.filter((file) => file.size > maxSize) : [];
    const accepted = list.filter((file) => !tooLarge.includes(file));

    setSizeError(
      tooLarge.length > 0 && maxSize
        ? `${tooLarge.map((file) => file.name).join(", ")} is larger than ${formatBytes(maxSize)}. Choose a smaller file.`
        : undefined,
    );
    if (accepted.length > 0) onFilesChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  };

  const removeFile = (target: File) => {
    onFilesChange(files.filter((file) => file !== target));
    // Reset so choosing the same file again still fires a change event.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div data-slot="file-upload" className={cn("grid gap-2", className)}>
      <label
        htmlFor={inputId}
        data-dragging={dragging || undefined}
        data-invalid={message ? true : undefined}
        data-disabled={disabled || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background px-6 py-8 text-center",
          "transition-[border-color,background-color] duration-(--duration-fast) ease-out",
          "hover:border-foreground/40 hover:bg-accent/50 active:bg-accent",
          "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
          "data-[dragging]:border-primary data-[dragging]:bg-accent",
          "data-[invalid]:border-destructive",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        )}
      >
        <UploadIcon className="size-6 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">{prompt}</span>
        <span id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${hintId} ${errorId}` : hintId}
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>

      {message ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="grid gap-2">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center gap-3 rounded-md border bg-card py-1 pr-1 pl-3 text-sm"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="tabular shrink-0 text-muted-foreground">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(file)}
                aria-label={`Remove ${file.name}`}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground",
                  "transition-[color,background-color] duration-(--duration-fast) ease-out",
                  "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { FileUpload };
export type { FileUploadProps };
