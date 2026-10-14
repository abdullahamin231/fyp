"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilePollResult, WatchedFileStatus } from "@/lib/integrations/figma-poll";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  return `${Math.round(seconds / 3600)} h ago`;
}

export function FigmaPoller({ slug, canManage }: { slug: string; canManage: boolean }) {
  const [files, setFiles] = useState<WatchedFileStatus[]>([]);
  const [fileKey, setFileKey] = useState("");
  const [results, setResults] = useState<FilePollResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    const response = await fetch(`/api/integrations/figma/files?workspace=${encodeURIComponent(slug)}`);
    const body = await response.json() as { files?: WatchedFileStatus[]; error?: string };
    if (!response.ok) throw new Error(body.error ?? "Could not load watched Figma files");
    setFiles(body.files ?? []);
  }, [slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFiles().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load watched Figma files"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadFiles]);

  async function addFile(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/integrations/figma/files?workspace=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });
      const body = await response.json() as { file?: WatchedFileStatus; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not watch Figma file");
      if (body.file) setFiles((current) => [...current, body.file as WatchedFileStatus]);
      setFileKey("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not watch Figma file");
    } finally {
      setBusy(false);
    }
  }

  async function removeFile(id: string) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/integrations/figma/files?workspace=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not remove Figma file");
      setFiles((current) => current.filter((file) => file.id !== id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove Figma file");
    } finally {
      setBusy(false);
    }
  }

  async function pollNow() {
    setBusy(true);
    setMessage(null);
    setResults([]);
    try {
      const response = await fetch(`/api/integrations/figma/poll?workspace=${encodeURIComponent(slug)}`, { method: "POST" });
      const body = await response.json() as { results?: FilePollResult[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not poll Figma");
      setResults(body.results ?? []);
      await loadFiles();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not poll Figma");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-surface-container-low shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-body-md font-semibold text-on-surface">Figma version polling</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Polling detects file versions on an interval; it does not receive Dev Mode status or file deletion events.
          The first poll baselines each file without importing its existing history.
        </p>
      </div>
      {canManage && (
        <form onSubmit={addFile} className="flex flex-wrap gap-2">
          <input
            value={fileKey}
            onChange={(event) => setFileKey(event.target.value)}
            placeholder="Figma file key"
            aria-label="Figma file key"
            className="min-w-0 flex-1 rounded border border-outline bg-surface px-3 py-2 font-mono-code text-micro-label text-on-surface"
          />
          <button type="submit" disabled={busy} className="rounded bg-primary-container px-3 py-2 font-body-sm font-medium text-on-primary-container disabled:opacity-50">
            Watch file
          </button>
        </form>
      )}
      <p className="font-body-sm text-micro-label text-muted">
        The key is the segment after <code>/design/</code> or <code>/file/</code> in a Figma URL.
      </p>
      {files.length > 0 ? (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div key={file.id} className="rounded-lg bg-surface-container p-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <code className="font-mono-code text-micro-label text-on-surface">{file.file_key}</code>
              <span className="font-mono-code text-micro-label text-muted">
                version {file.last_seen_version_id ?? "not baselined"} · polled {timeAgo(file.last_polled_at)}
              </span>
              {file.last_poll_error && <span className="font-body-sm text-micro-label text-error">{file.last_poll_error}</span>}
              {canManage && (
                <button type="button" disabled={busy} onClick={() => removeFile(file.id)} className="ml-auto font-body-sm text-micro-label text-error underline disabled:opacity-50">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body-sm text-micro-label text-muted">No Figma files are being watched.</p>
      )}
      {canManage && (
        <button type="button" disabled={busy || files.length === 0} onClick={pollNow} className="self-start rounded bg-surface-container-highest px-3 py-2 font-body-sm font-medium text-on-surface disabled:opacity-50">
          {busy ? "Polling..." : "Poll now"}
        </button>
      )}
      {message && <p className="font-body-sm text-micro-label text-error">{message}</p>}
      {results.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-outline-variant pt-3">
          {results.map((result) => (
            <p key={result.fileKey} className="font-mono-code text-micro-label text-on-surface">
              {result.fileKey}: {result.status} ({result.versionsIngested} version{result.versionsIngested === 1 ? "" : "s"})
              {result.error ? ` — ${result.error}` : ""}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
