"use client";

export default function ExportCsvButton({
  csv,
  filename
}: {
  csv: string;
  filename: string;
}) {
  const onClick = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={onClick} className="btn-ghost">
      Export CSV
    </button>
  );
}
