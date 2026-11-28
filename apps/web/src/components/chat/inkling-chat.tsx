"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "What can you help me with?",
  "Explain how a verification worker evaluates evidence.",
  "Give me a concise summary of the Inkling model.",
];

export function InklingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "The model request failed.";
        throw new Error(message);
      }
      if (!isRecord(result) || typeof result.message !== "string" || !result.message.trim()) {
        throw new Error("The model returned an empty or invalid response.");
      }
      setMessages([...nextMessages, { role: "assistant", content: result.message }]);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The model request failed.");
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  function clearConversation() {
    if (busy) return;
    setMessages([]);
    setDraft("");
    setError(null);
  }

  return (
    <section className="mx-auto flex h-[calc(100dvh-8rem)] min-h-[32rem] max-w-5xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-md">
      <header className="flex items-center justify-between gap-4 border-b border-outline-variant px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-container-highest">
            <Icon name="smart_toy" className="text-[22px] text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Inkling Chat</h1>
            <p className="font-mono-code text-micro-label text-on-surface-variant">
              inkling-2-mini:26b-a5b · runs on the UNIFY server
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          leadingIcon="delete_sweep"
          onClick={clearConversation}
          disabled={messages.length === 0 || busy}
          className="shrink-0"
        >
          Clear
        </Button>
      </header>

      <div
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-container-high">
              <Icon name="forum" className="text-[28px] text-primary" />
            </div>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              What would you like to ask?
            </h2>
            <p className="mt-2 max-w-lg text-body-sm text-on-surface-variant">
              Your messages are sent to the Inkling model running on the server. This chat is temporary
              and is not saved when you leave the page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void sendMessage(starter)}
                  disabled={busy}
                  className="rounded-full border border-outline-variant bg-surface-container px-3 py-2 text-left text-body-sm text-on-surface-variant transition hover:border-outline hover:bg-surface-container-high disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${index}-${message.role}`}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-highest">
                  <Icon name="smart_toy" className="text-[17px] text-primary" />
                </div>
              ) : null}
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-body-md ${
                  message.role === "user"
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant bg-surface-container text-on-surface"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              {message.role === "user" ? (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-highest">
                  <Icon name="person" className="text-[17px] text-on-surface-variant" />
                </div>
              ) : null}
            </article>
          ))
        )}
        {busy ? (
          <div className="flex items-center gap-3 text-body-sm text-on-surface-variant" role="status">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface-container-highest">
              <Icon name="smart_toy" className="text-[17px] text-primary" />
            </div>
            <span className="animate-pulse">Inkling is thinking…</span>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="mx-auto max-w-2xl rounded-lg border border-error/40 bg-error-container/30 px-4 py-3 text-body-sm text-on-error-container">
            {error}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-outline-variant bg-surface-container-low p-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          <label className="sr-only" htmlFor="inkling-message">Message Inkling</label>
          <textarea
            ref={textareaRef}
            id="inkling-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Inkling…"
            rows={2}
            maxLength={8000}
            disabled={busy}
            className="max-h-40 min-h-12 flex-1 resize-y rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-body-md text-on-surface placeholder:text-muted focus:border-outline focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
          />
          <Button
            type="submit"
            leadingIcon={busy ? "progress_activity" : "send"}
            disabled={!draft.trim() || busy}
            className="h-12 px-4"
          >
            <span className="sr-only sm:not-sr-only">{busy ? "Sending" : "Send"}</span>
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-right font-mono-code text-[11px] text-muted">
          Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </section>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
