export default function FileUploadDropzone({ file, previewUrl, onFileSelect }) {
  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }
    onFileSelect(selectedFile);
  };

  if (file && previewUrl) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4">
        <div className="flex items-center gap-4">
          <img src={previewUrl} alt="Complaint preview" className="h-[60px] w-[60px] rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-brand-ink">{file.name}</p>
            <p className="text-sm text-slate-500">{Math.round(file.size / 1024)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="shrink-0 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            ✕ Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      htmlFor="complaint-image"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFile(event.dataTransfer.files?.[0] || null);
      }}
      className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-brand-sky/40 bg-brand-mist/70 px-6 py-10 text-center"
    >
      <input
        id="complaint-image"
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(event) => handleFile(event.target.files?.[0] || null)}
        className="hidden"
      />
      <span className="text-3xl" aria-hidden="true">
        🖼️
      </span>
      <p className="mt-3 font-semibold text-brand-ink">Drag and drop an image here</p>
      <p className="mt-1 text-sm text-slate-500">or click to browse JPG, PNG, or WEBP files up to 5MB.</p>
    </label>
  );
}
