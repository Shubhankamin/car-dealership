import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { uploadImage } from '../api/uploads';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // keep in sync with the backend limit

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the admin pick the same file again
    if (!file) return;

    setError(null);
    // Quick checks for fast feedback. The server validates again and is the real authority.
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 2 MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">Photo</span>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          {value ? <img src={value} alt="Vehicle preview" className="h-full w-full object-cover" /> : 'No photo'}
        </div>
        <label
          className={`inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 ${
            uploading ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {uploading ? 'Uploading...' : value ? 'Replace photo' : 'Choose photo'}
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            aria-label="Vehicle photo"
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
