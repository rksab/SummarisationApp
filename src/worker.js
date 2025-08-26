import { pipeline, TextStreamer } from "@huggingface/transformers";

class MySummarizationPipeline {
  static task = "summarization";
  static model = "Xenova/distilbart-cnn-6-6"; 
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance) {
      return this.instance;
    }
    
    try {
      this.instance = await pipeline(this.task, this.model, { 
        progress_callback, 
        dtype: "q8"
      });
      return this.instance;
    } catch (error) {
      self.postMessage({ 
        status: "error", 
        error: "Failed to load summarization model: " + error.message 
      });
      throw error;
    }
  }
}

self.addEventListener("message", async (event) => {
  try {
    const { text } = event.data;

    // Send initial status
    self.postMessage({ status: "initializing" });

    const summarizer = await MySummarizationPipeline.getInstance((data) => {
      // Enhanced progress reporting with file info
      if (data.status === "progress") {
        self.postMessage({ 
          status: "progress", 
          file: data.file || "model",
          progress: data.progress || 0,
          loaded: data.loaded || 0,
          total: data.total || 100
        });
      }
    });

    // Model is ready
    self.postMessage({ status: "ready" });

    // Start summarization
    self.postMessage({ status: "summarizing" });

    const streamer = new TextStreamer(summarizer.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text) => {
        self.postMessage({ status: "update", output: text });
      },
    });

    const summary = await summarizer(text, { 
      streamer
    });

    self.postMessage({
      status: "complete",
      output: summary[0]?.summary_text || "No summary available.",
    });

  } catch (error) {
    console.error("Worker error:", error);
    self.postMessage({ 
      status: "error", 
      error: "Summarization failed: " + error.message 
    });
  }
});