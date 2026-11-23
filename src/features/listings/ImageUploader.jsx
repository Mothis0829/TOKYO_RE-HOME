import { useEffect, useId, useRef, useState } from "react";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function ImagePreview({ file, onRemove }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // A temporary browser-only URL. This is NOT a Supabase Storage URL.
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="image-uploader__preview">
      {url && <img src={url} alt={`Preview of ${file.name}`} />}
      <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>
        ×
      </button>
    </div>
  );
}

/**
 * Controlled image picker: its parent owns the File[] array.
 * Props: value: File[], onChange: (nextFiles: File[]) => void,
 *        maxFiles?: number, maxSizeMB?: number, disabled?: boolean
 */
export default function ImageUploader({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 2,
  disabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  function handleFiles(event) {
    const chosen = Array.from(event.target.files ?? []);
    const next = [...value];
    const problems = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of chosen) {
      if (!ALLOWED_TYPES.has(file.type)) {
        problems.push(`${file.name}: only JPG, PNG, or WebP allowed.`);
        continue;
      }
      if (file.size > maxBytes) {
        problems.push(`${file.name}: maximum ${maxSizeMB} MB per image.`);
        continue;
      }
      if (next.length >= maxFiles) {
        problems.push(`You can upload at most ${maxFiles} photos.`);
        break;
      }
      const duplicate = next.some(
        (old) =>
          old.name === file.name &&
          old.size === file.size &&
          old.lastModified === file.lastModified
      );
      if (!duplicate) next.push(file);
    }

    onChange?.(next);
    setError(problems.join(" "));
    // Allows choosing the same file again after removing it.
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index) {
    onChange?.(value.filter((_, i) => i !== index));
    setError("");
  }

  return (
    <div className="image-uploader">
      <label htmlFor={inputId} className="listing-label">
        Furniture photos (up to {maxFiles})
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled || value.length >= maxFiles}
        onChange={handleFiles}
      />
      <p className="listing-help">JPG, PNG or WebP · {maxSizeMB} MB per photo</p>
      {error && <p className="listing-error" role="alert">{error}</p>}

      <div className="image-uploader__grid">
        {value.map((file, index) => (
          <ImagePreview
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            file={file}
            onRemove={() => removeImage(index)}
          />
        ))}
      </div>
    </div>
  );
}
