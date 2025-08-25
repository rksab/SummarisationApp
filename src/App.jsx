import { useState, useEffect, useRef } from "react";
import './index.css'

export default function App() {
  const worker = useRef(null);

  // State management
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  //incase you need to update progress
  const [progressItems, setProgressItems] = useState([]);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(" Initializing .... ")

  // Function to start summarization
  const summarize = () => {
    if (!text.trim()){
      setError("Please enter text to summarize. ")
      return; 
    }
    setDisabled(true);
    setSummary("");
    setError("");
    setStatus("Starting Summarisation....")
    worker.current.postMessage({ text });
  };

  useEffect(() => {
    // Create Web Worker
    worker.current ??= new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    // Worker message event handler
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "progress":
          setProgressItems((prev) =>
            prev.map((item) =>
              item.file === e.data.file ? { ...item, progress: e.data.progress } : item
            )
          );
          break;

        case "update":
          setSummary((s) => s + e.data.output);
          break;

        case "complete":
          setDisabled(false);
          setText(""); 
          break;

        case "ready":
          setReady(true);
          break;
          
        case "error":
            setError(e.data.error || "An unknown error occurred");
            setDisabled(false);
            setStatus("Error occurred");
            break;

        default:
          console.warn("Unknown worker message:", e.data);
      }
    };

    // Attach event listener
    worker.current.addEventListener("message", onMessageReceived);

    // Cleanup on unmount
    return () => worker.current.removeEventListener("message", onMessageReceived);
  }, []);

  return (
    <div className ="flex flex-col min-h-screen">
    <header className="bg-gray-600 px-8 py-6 text-center text-white shadow-md">
      <h1 className="mb-2 text-3xl font-bold">AI TEXT SUMMARIZER</h1>
      <p className="opacity-90">Powered by DistilBART - Transform long text into concise summaries</p>
    </header>
    <main className="flex flex-grow items-center justify-center bg-gray-100">
  <div className="w-full max-w-xl p-6 flex flex-col">
    <textarea
      className="mb-4 h-32 w-full resize-none rounded border border-gray-300 p-3"
      placeholder="Enter text to summarize"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
     {error && (
    <p className="text-sm text-red-600 mb-2">{error}</p>
  )}
    <button
      className="w-full mb-4 rounded bg-gray-600 py-4 text-white transition hover:bg-gray-700"
      onClick={summarize}
      disabled={disabled}
    >
      {disabled ? "Summarizing..." : "Summarize"}
    </button>

    <div className="mt-4">
      <p className="text-gray-600">Summary:</p>
      <p className="mt-2 border p-2 rounded bg-gray-100">{summary}</p>
    </div>
  </div>
</main>
    <footer className="h-16 bg-gray-600"></footer>
    </div>
  );
}
