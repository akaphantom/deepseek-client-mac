import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "ВСТАВИТЬ_ИЗ_ЛК_ДИПСИКА", // ← вставьте свой ключ
  dangerouslyAllowBrowser: true,
});

const chatBox = document.querySelector<HTMLDivElement>("#chat-box")!;
const input = document.querySelector<HTMLTextAreaElement>("#message-input")!;
const sendBtn = document.querySelector<HTMLButtonElement>("#send-btn")!;

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  sendBtn.disabled = true;
  input.value = "";

  appendMessage("user", text);
  const assistantBubble = appendMessage("assistant", "");

  try {
    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: text }],
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
      assistantBubble.textContent = fullResponse;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (error) {
    assistantBubble.textContent = "Ошибка: " + (error as Error).message;
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendMessage(role: "user" | "assistant", text: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});