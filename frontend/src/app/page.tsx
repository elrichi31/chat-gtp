"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from "openai";
import ChatBubble from "@/components/ChatBubble";

function Chatty() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    ChatCompletionRequestMessage[]
  >([]);
  const scrollToDiv = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    setTimeout(function () {
      scrollToDiv.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const messages = [
      ...chatMessages,
      { role: "user", content: query } as ChatCompletionRequestMessage,
    ];
    setChatMessages(messages);

    setQuery("");
    console.log(process.env.NEXT_PUBLIC_REACT_APP_API_URL)
    const response = await fetch(`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      handleError(response.statusText);
    }
    const json = (await response.json()) as CreateChatCompletionResponse;
    scrollToBottom();
    try {
      setLoading(false);
      setChatMessages((m) => [
        ...m,
        json.choices[0].message as ChatCompletionRequestMessage,
      ]);
      setAnswer("");
    } catch (error) {
      if (error instanceof Error) {
        handleError(error.message);
      }
    }
  };

  function handleError(err: string) {
    setLoading(false);
    setQuery("");
    setAnswer("");
    console.error(err);
  }

  useEffect(() => {
    if (scrollToDiv.current) {
      scrollToDiv.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, answer, loading]);

// ... (imports y demás código se mantienen igual)

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg w-[90%] shadow-lg">
        <div className="flex flex-row justify-between p-4 border-b">
          <h1 className="text-2xl font-semibold text-gray-700">
            ChatGPT(unblocked) 🧅🥵
          </h1>
        </div>
        <div className="h-96 p-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <ChatBubble type="assistant" message="¿Cómo puedo ayudarte hoy?" />
            {chatMessages.map((message, index) => (
              <ChatBubble
                key={index}
                type={message.role}
                message={message.content}
              />
            ))}
            {answer && <ChatBubble type="assistant" message={answer} />}
            {loading && <ChatBubble type="assistant" message="Loading.." />}
          </div>
          <div ref={scrollToDiv} />
        </div>
        <div className="p-4 bg-gray-50">
          <form
            className="flex rounded-md gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="flex-grow border-2 border-gray-300 focus:border-blue-300 rounded-md py-2 px-4 focus:outline-none focus:ring transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}

export default Chatty;
