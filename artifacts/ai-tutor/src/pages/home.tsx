import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useAskTutor } from "@workspace/api-client-react";
import {
  SendHorizontal,
  MessageSquare,
  BookOpen,
  ClipboardList,
  CalendarDays,
  FileQuestion,
  Loader2,
  Sparkles,
  Share2,
  Copy,
  Check,
  X,
  Moon,
  Sun,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "chat" | "quiz" | "roadmap" | "practice" | "pyq" | "notes";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent_used?: string;
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode; short: string }[] = [
  { id: "chat",     label: "AI Tutor",           icon: <MessageSquare className="w-4 h-4" />,  short: "Chat"     },
  { id: "quiz",     label: "Quiz Generator",     icon: <ClipboardList className="w-4 h-4" />,  short: "Quiz"     },
  { id: "roadmap",  label: "Study Roadmap",      icon: <CalendarDays className="w-4 h-4" />,   short: "Roadmap"  },
  { id: "practice", label: "Practice Questions", icon: <BookOpen className="w-4 h-4" />,       short: "Practice" },
  { id: "pyq",      label: "PYQ Helper",         icon: <FileQuestion className="w-4 h-4" />,   short: "PYQ"      },
  { id: "notes",    label: "Notes Finder",       icon: <Sparkles className="w-4 h-4" />,       short: "Notes"    },
];

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

const CHAT_PROMPTS = [
  "Explain the difference between process and thread in OS",
  "What is normalization in DBMS? Give an example",
  "Explain TCP/IP model with layers",
  "What is dynamic programming? How does it differ from recursion?",
];

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const askTutor = useAskTutor();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askTutor.isPending]);

  const send = (text: string) => {
    if (!text.trim() || askTutor.isPending) return;
    setMessages((p) => [...p, { id: crypto.randomUUID(), role: "user", content: text }]);
    setInput("");
    askTutor.mutate(
      { data: { question: text } },
      {
        onSuccess: (r) =>
          setMessages((p) => [
            ...p,
            { id: crypto.randomUUID(), role: "assistant", content: r.answer, agent_used: r.agent_used },
          ]),
        onError: () =>
          setMessages((p) => [
            ...p,
            { id: crypto.randomUUID(), role: "assistant", content: "Something went wrong. Please try again.", agent_used: "Error" },
          ]),
      }
    );
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10 animate-in fade-in duration-500">
            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center mb-5 shadow-lg">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Ask anything about KTU CSE</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">
              Explain concepts, clarify doubts, get examples. The AI Tutor adapts its answer to you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {CHAT_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  data-testid={`prompt-chat-${i}`}
                  className="text-left p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border shadow-sm rounded-bl-sm"}`}>
                  {m.role === "assistant" && m.agent_used && (
                    <Badge variant="secondary" className="mb-2 font-mono text-[10px] uppercase tracking-wider h-5 px-1.5">
                      {m.agent_used}
                    </Badge>
                  )}
                  <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : ""}`}>
                    {m.role === "user"
                      ? <p className="m-0 whitespace-pre-wrap">{m.content}</p>
                      : <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>}
                  </div>
                </div>
              </div>
            ))}
            {askTutor.isPending && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    {["-0.3s", "-0.15s", "0s"].map((d, i) => (
                      <div key={i} className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: d }} />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="flex-none p-3 border-t bg-background">
        <div className="flex items-end gap-2 bg-card border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={askTutor.isPending}
            placeholder={askTutor.isPending ? "Waiting..." : "Ask your question..."}
            data-testid="input-chat"
            rows={1}
            style={{ fieldSizing: "content" as never }}
            className="flex-1 min-h-[48px] max-h-32 resize-none bg-transparent p-3 text-sm focus:outline-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || askTutor.isPending}
            data-testid="button-send-chat"
            className="mb-1.5 mr-1.5 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors h-9 w-9 flex items-center justify-center active:scale-95 flex-shrink-0"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground font-mono mt-1.5">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({
  result,
  agentUsed,
  tab,
  resultRef,
}: {
  result: string;
  agentUsed: string | null;
  tab: string;
  resultRef: React.RefObject<HTMLDivElement>;
}) {
  const [copied, setCopied] = useState(false);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      const el = document.createElement("textarea");
      el.value = result;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={resultRef}
      className="animate-in fade-in slide-in-from-bottom-3 duration-400 border rounded-2xl bg-card shadow-sm overflow-hidden"
      data-testid={`result-${tab}`}
    >
      <div className="px-4 py-2.5 border-b bg-muted/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {agentUsed && (
            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider h-5 px-1.5">
              {agentUsed}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono">Generated result</span>
        </div>
        <button
          onClick={copyResult}
          data-testid={`button-copy-result-${tab}`}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors text-foreground flex-shrink-0"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
            : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          }
        </button>
      </div>
      <div className="p-5 prose prose-sm max-w-none text-foreground prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
      </div>
    </div>
  );
}

// ─── Generic Tool Tab (Quiz / Roadmap / Practice / PYQ / Notes) ───────────────

type ToolConfig = {
  icon: React.ReactNode;
  heading: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  buildQuestion: (topic: string) => string;
  exampleTopics: string[];
};

const TOOL_CONFIGS: Record<Exclude<Tab, "chat">, ToolConfig> = {
  quiz: {
    icon: <ClipboardList className="w-6 h-6 text-primary-foreground" />,
    heading: "Quiz Generator",
    description: "MCQ-style self-test. Get 5 multiple-choice questions with 4 options and the correct answer marked — perfect for quick knowledge checks before an exam.",
    placeholder: "e.g. Binary Trees, TCP/IP, Operating System Scheduling…",
    buttonLabel: "Generate MCQ Quiz",
    buildQuestion: (t) => `Generate a 5-question MCQ quiz for the KTU CSE topic: "${t}". For each question provide: the question, 4 labelled options (A/B/C/D), and clearly mark the correct answer. Format it cleanly.`,
    exampleTopics: ["Binary Trees", "Process Scheduling in OS", "SQL Joins", "Computer Networks — TCP/IP"],
  },
  roadmap: {
    icon: <CalendarDays className="w-6 h-6 text-primary-foreground" />,
    heading: "Study Roadmap",
    description: "Get a structured 7-day study plan for any KTU subject or topic.",
    placeholder: "e.g. DBMS, Data Structures, Computer Networks, Algorithms…",
    buttonLabel: "Generate Roadmap",
    buildQuestion: (t) => `Create a 7 day study plan with daily goals for a KTU CSE student studying: ${t}`,
    exampleTopics: ["Data Structures and Algorithms", "Database Management Systems", "Computer Networks", "Operating Systems"],
  },
  practice: {
    icon: <BookOpen className="w-6 h-6 text-primary-foreground" />,
    heading: "Practice Questions",
    description: "University exam-style descriptive questions with model answers. These are open-ended short/long answer questions like KTU would ask in written exams — ideal for answer-writing practice.",
    placeholder: "e.g. Recursion, Normalization, Memory Management…",
    buttonLabel: "Generate Descriptive Questions",
    buildQuestion: (t) => `Generate 5 KTU university exam-style descriptive questions (short answer or long answer) for the topic: "${t}". For each question, also provide a concise model answer that a student could write in an exam. Format clearly with question numbers.`,
    exampleTopics: ["Recursion and its applications", "Database Normalization", "Memory Management in OS", "Graph Algorithms"],
  },
  pyq: {
    icon: <FileQuestion className="w-6 h-6 text-primary-foreground" />,
    heading: "PYQ Helper",
    description: "Paste a previous year exam question and get a detailed model answer.",
    placeholder: "Paste your previous year question here…",
    buttonLabel: "Get Model Answer",
    buildQuestion: (t) => `Provide a detailed model answer for this KTU CSE exam question: ${t}`,
    exampleTopics: [
      "Explain the working of Dijkstra's shortest path algorithm with an example",
      "What is deadlock? Explain the four necessary conditions for deadlock",
      "Explain TCP 3-way handshake with a diagram",
      "Write an algorithm for inserting a node in a BST",
    ],
  },
  notes: {
    icon: <Sparkles className="w-6 h-6 text-primary-foreground" />,
    heading: "Notes Finder",
    description: "Find the best KTU notes and study resources for any CSE subject.",
    placeholder: "e.g. Computer Networks, Data Structures, DBMS…",
    buttonLabel: "Find Notes",
    buildQuestion: (t) => `Find KTU notes and study resources for: ${t}`,
    exampleTopics: ["Computer Networks", "Data Structures", "Operating Systems", "DBMS"],
  },
};

function ToolTab({ tab }: { tab: Exclude<Tab, "chat"> }) {
  const cfg = TOOL_CONFIGS[tab];
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [agentUsed, setAgentUsed] = useState<string | null>(null);
  const askTutor = useAskTutor();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const generate = (overrideTopic?: string) => {
    const t = overrideTopic ?? topic;
    if (!t.trim() || askTutor.isPending) return;
    setResult(null);
    setAgentUsed(null);
    askTutor.mutate(
      { data: { question: cfg.buildQuestion(t) } },
      {
        onSuccess: (r) => { setResult(r.answer); setAgentUsed(r.agent_used); },
        onError: () => setResult("Something went wrong. Please try again."),
      }
    );
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow">
            {cfg.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{cfg.heading}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{cfg.description}</p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKey}
            disabled={askTutor.isPending}
            placeholder={cfg.placeholder}
            data-testid={`input-${tab}`}
            className="min-h-[80px] resize-none text-sm"
          />
          <Button
            onClick={() => generate()}
            disabled={!topic.trim() || askTutor.isPending}
            data-testid={`button-generate-${tab}`}
            className="w-full"
          >
            {askTutor.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              cfg.buttonLabel
            )}
          </Button>
        </div>

        {/* Example chips */}
        {!result && !askTutor.isPending && (
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {cfg.exampleTopics.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setTopic(ex); generate(ex); }}
                  data-testid={`chip-${tab}-${i}`}
                  className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {askTutor.isPending && (
          <div className="animate-in fade-in duration-300 space-y-3 pt-2" data-testid="loading-skeleton">
            <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded-full w-full animate-pulse" />
            <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded-full w-full animate-pulse" />
            <div className="h-4 bg-muted rounded-full w-2/3 animate-pulse" />
          </div>
        )}

        {/* Result */}
        {result && (
          <ResultCard result={result} agentUsed={agentUsed} tab={tab} resultRef={resultRef} />
        )}
      </div>
    </div>
  );
}

// ─── Dark Mode Hook ───────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("ktu-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ktu-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url = window.location.href;
  const waUrl = `https://wa.me/?text=${encodeURIComponent("Check out KTU AI Tutor — an AI-powered study assistant for KTU CSE students! " + url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
    } catch {
      /* fallback: select a temp input */
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "KTU AI Tutor", text: "AI-powered study assistant for KTU CSE students", url });
      setOpen(false);
    }
  };

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (navigator.share ? nativeShare() : setOpen((o) => !o))}
        data-testid="button-share"
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors text-foreground"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border rounded-xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Share KTU AI Tutor</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground font-mono bg-muted rounded-lg px-2.5 py-2 mb-3 truncate select-all">
            {url}
          </div>

          <div className="space-y-2">
            <button
              onClick={copyLink}
              data-testid="button-copy-link"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border hover:bg-primary/5 hover:border-primary/30 transition-colors text-left"
            >
              {copied ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <div>
                <p className="text-xs font-medium text-foreground">{copied ? "Copied!" : "Copy link"}</p>
                <p className="text-[10px] text-muted-foreground">Paste anywhere</p>
              </div>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              data-testid="button-share-whatsapp"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/30 dark:hover:border-green-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-500 flex-shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <p className="text-xs font-medium text-foreground">Share on WhatsApp</p>
                <p className="text-[10px] text-muted-foreground">Send to classmates</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const { dark, toggle } = useDarkMode();

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-4xl mx-auto border-x border-border/50 shadow-sm">
      {/* Header */}
      <header className="flex-none px-4 pt-3 pb-0 bg-background/90 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-xs font-bold">KTU</span>
            AI Tutor
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-secondary px-2 py-1 rounded border text-secondary-foreground hidden sm:block">
              System: Online
            </span>
            <button
              onClick={toggle}
              data-testid="button-theme-toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-8 h-8 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors text-foreground"
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <ShareButton />
          </div>
        </div>

        {/* Tab bar */}
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-none -mx-1 px-1" data-testid="tab-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              data-testid={`tab-${t.id}`}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors flex-shrink-0 border-b-2 ${
                activeTab === t.id
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "chat"     && <div className="h-full flex flex-col"><ChatTab /></div>}
        {activeTab === "quiz"     && <div className="h-full overflow-y-auto"><ToolTab tab="quiz" /></div>}
        {activeTab === "roadmap"  && <div className="h-full overflow-y-auto"><ToolTab tab="roadmap" /></div>}
        {activeTab === "practice" && <div className="h-full overflow-y-auto"><ToolTab tab="practice" /></div>}
        {activeTab === "pyq"      && <div className="h-full overflow-y-auto"><ToolTab tab="pyq" /></div>}
        {activeTab === "notes"    && <div className="h-full overflow-y-auto"><ToolTab tab="notes" /></div>}
      </main>
    </div>
  );
}
