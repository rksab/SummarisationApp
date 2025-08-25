# 🧠 Summarization App using Hugging Face Transformers and Web Workers

This is a lightweight React app that uses [Hugging Face Transformers.js](https://github.com/xenova/transformers.js) to perform real-time text summarization in the browser — no backend required.

The summarization runs entirely on the client via WebAssembly using the [`Xenova/distilbart-cnn-6-6`](https://huggingface.co/Xenova/distilbart-cnn-6-6) model. Output is streamed token-by-token using `TextStreamer`.

---

## Live demo

[\[](https://summarisationapp.onrender.com/)](https://summarisationapp.onrender.com/)

## ✨ Features

- 🧠 In-browser text summarization using a BART model
- ⚡ Web Worker for async computation without UI blocking
- 📡 Real-time token streaming via `TextStreamer`
- 🔐 No backend, no API keys — works offline after model is cached

---

## 🛠 Tech Stack

- `Xenova/distilbart-cnn-6-6` model (quantized version) from `@huggingface/transformers` (via [transformers.js](https://github.com/xenova/transformers.js))
- `React`
- `Web Workers`
- `TextStreamer` for real-time streaming

---
