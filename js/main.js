import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm";

const $ = (el) => document.querySelector(el);

// Elementos del DOM
const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $messages = $("ul");
const $container = $("main");
const $button = $("button[type='submit']");
const $info = $("small");
const $loading = $(".loading");
const $newChatBtn = $("#new-chat-btn");

let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
let end = false;

const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC-1k";

// Función para guardar mensajes en localStorage
function saveMessages() {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Habilitar el botón de enviar cuando el usuario escribe algo
$input.addEventListener("input", () => {
  $button.disabled = !$input.value.trim();
});

// Cargar mensajes previos al iniciar la página
function loadMessages() {
  messages.forEach(({ content, role }) => addMessage(content, role));
  scrollToBottom();
}

// Inicializar el modelo
const engine = await CreateWebWorkerMLCEngine(
  new Worker("./worker.js", { type: "module" }),
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      $info.textContent = info.text;
      if (info.progress === 1 && !end) {
        end = true;
        $loading?.parentNode?.removeChild($loading);
        $button.removeAttribute("disabled");

        if (messages.length === 0) {
          addMessage(
            "¡Hola! Soy GPT, un asistente de IA que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?",
            "bot"
          );
        }

        loadMessages();
        $input.focus();
      }
    },
  }
);

// Evento de envío del formulario
$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = $input.value.trim();

  if (messageText !== "") {
    $input.value = "";
    addMessage(messageText, "user");

    messages.push({ role: "user", content: messageText });
    saveMessages();
  }

  $button.disabled = true; // Deshabilita el botón mientras se genera la respuesta

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true,
  });

  let reply = "";
  const $botMessage = addMessage("", "bot");

  for await (const chunk of chunks) {
    const choice = chunk.choices[0];
    const content = choice?.delta?.content ?? "";
    reply += content;
    $botMessage.textContent = reply;
    scrollToBottom();
  }

  $button.disabled = false; // Habilita el botón después de la respuesta del bot
  $input.focus();

  messages.push({ role: "assistant", content: reply });
  saveMessages();
  scrollToBottom();
});

// Función para añadir mensajes al chat
function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true);
  const $newMessage = clonedTemplate.querySelector(".message");

  const $who = $newMessage.querySelector("span");
  const $text = $newMessage.querySelector("p");

  $text.textContent = text;
  $who.textContent = sender === "bot" ? "GPT" : "Tú";
  $newMessage.classList.add(sender);

  $text.style.color = "#ffffff"; // Asegurar que el texto es blanco

  $messages.appendChild($newMessage);
  scrollToBottom();

  return $text;
}

// Función para hacer scroll hasta el final del chat
function scrollToBottom() {
  $container.scrollTop = $container.scrollHeight;
}

// Función para reiniciar el chat
function resetChat() {
  localStorage.removeItem("chatMessages");
  messages = [];
  $messages.innerHTML = "";

  addMessage(
    "¡Hola! Soy GPT, un asistente de IA que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?",
    "bot"
  );

  messages.push({
    role: "assistant",
    content: "¡Hola! Soy GPT, un asistente de IA que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?",
  });

  saveMessages();

  $button.disabled = false; // Habilita el botón al iniciar un nuevo chat
  $input.focus();
}

// Evento para el botón "Nuevo Chat"
$newChatBtn.addEventListener("click", resetChat);
