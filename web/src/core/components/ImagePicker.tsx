import { useId, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { SecondaryButton } from './Button';

interface ImagePickerProps {
  /** An existing image URL to show before the user picks a new file. */
  currentUrl?: string;
  /** Called with the chosen file, or null when the image is cleared. */
  onChange: (file: File | null) => void;
  error?: string;
  /** Field label shown above the picker. */
  label?: string;
  /** Shown in the preview box when no image is set. */
  placeholder?: ReactNode;
  /** Renders the preview as a circle (for avatars) instead of a rounded square. */
  circular?: boolean;
}

/** Picks an image (store item or avatar) and shows a live preview. */
export function ImagePicker({
  currentUrl,
  onChange,
  error,
  label = 'Image (optional)',
  placeholder = <span className="text-3xl" aria-hidden>🎁</span>,
  circular = false,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  function handleFile(file: File | null) {
    if (preview && preview !== currentUrl) {
      URL.revokeObjectURL(preview);
    }
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(undefined);
    }
    onChange(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-body font-semibold">
        {label}
      </span>
      <div className="flex items-center gap-4" aria-labelledby={id}>
        <div
          className={clsx(
            'flex h-24 w-24 items-center justify-center overflow-hidden bg-bgLight',
            circular ? 'rounded-full' : 'rounded-xl',
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Selected"
              className="h-full w-full object-cover"
            />
          ) : (
            placeholder
          )}
        </div>
        <div className="flex flex-col gap-2">
          <SecondaryButton
            type="button"
            onClick={() => inputRef.current?.click()}
            className="min-h-[40px] px-4"
          >
            Choose image
          </SecondaryButton>
          {preview && (
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="text-caption font-semibold text-danger underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
