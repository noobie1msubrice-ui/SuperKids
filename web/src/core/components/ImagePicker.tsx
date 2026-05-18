import { useId, useRef, useState } from 'react';
import { SecondaryButton } from './Button';

interface ImagePickerProps {
  /** An existing image URL to show before the user picks a new file. */
  currentUrl?: string;
  /** Called with the chosen file, or null when the image is cleared. */
  onChange: (file: File | null) => void;
  error?: string;
}

/** Picks an optional store-item image and shows a live preview. */
export function ImagePicker({ currentUrl, onChange, error }: ImagePickerProps) {
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
        Image (optional)
      </span>
      <div className="flex items-center gap-4" aria-labelledby={id}>
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-bgLight">
          {preview ? (
            <img
              src={preview}
              alt="Selected store item"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl" aria-hidden>
              🎁
            </span>
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
