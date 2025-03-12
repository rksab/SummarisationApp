import { useState, useEffect, useRef } from "react";

export default function App() {
  const worker = useRef(null);

  // State management
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  // Function to start summarization
  const summarize = () => {
    setDisabled(true);
    setSummary("");
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
          break;

        case "ready":
          setReady(true);
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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Summarization App</h1>

      <label className="block font-semibold mb-2">Enter text to summarize:</label>
      <textarea
        className="w-full p-2 border rounded"
        rows="5"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <button
        className="mt-2 bg-blue-500 text-white p-2 rounded"
        onClick={summarize}
        disabled={disabled}
      >
        {disabled ? "Summarizing..." : "Summarize"}
      </button>

      {ready === false && <p className="mt-2 text-gray-500">Loading models...</p>}

      <div className="mt-4">
        <h2 className="font-bold">Summary:</h2>
        <p className="mt-2 border p-2 rounded bg-gray-100">{summary}</p>
      </div>
    </div>
  );
}
