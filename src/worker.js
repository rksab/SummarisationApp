import { pipeline, TextStreamer } from "@huggingface/transformers";

class MySummarizationPipeline {
  static task = "summarization";
  static model = "Xenova/distilbart-cnn-6-6"; 
  static instance = null;

  static async getInstance(progress_callback = null) {
    this.instance ??= await pipeline(this.task, this.model, { progress_callback, dtype: "q8"});
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const summarizer = await MySummarizationPipeline.getInstance((x) => {
    self.postMessage({ status: "progress", progress: x });
  });

  const streamer = new TextStreamer(summarizer.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      self.postMessage({ status: "update", output: text });
    },
  });

  const summary = await summarizer(event.data.text, { streamer });

  self.postMessage({
    status: "complete",
    output: summary[0]?.summary_text || "No summary available.",
  });
});