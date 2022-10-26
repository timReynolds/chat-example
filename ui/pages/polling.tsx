import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { SignIn, OnlineStatus, Username } from "../components";

const NEXT_PUBLIC_CHAT_SERVER_URL =
  process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:4000";

const RECONNECT_SPEED = 1000;
const ERROR_RECONNECT_SPEED = 5000;

const Polling: NextPage = () => {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [{ messages, users }, setChatState] = useState<{
    messages: Array<{ username: string; message: string }>;
    users: Array<{ username: string; online: boolean }>;
  }>({
    messages: [],
    users: [],
  });
  const [subscribeError, setSubscribeError] = useState<boolean>(false);

  async function subscribe(from: number, signal: AbortSignal) {
    try {
      setSubscribeError(false);
      let response = await fetch(
        `${NEXT_PUBLIC_CHAT_SERVER_URL}/poll?${new URLSearchParams({
          username,
          from: from.toString(),
        })}`,
        { signal }
      );

      if (response.status == 502) {
        await new Promise((resolve) =>
          setTimeout(resolve, ERROR_RECONNECT_SPEED)
        );
        await subscribe(from, signal);
      } else if (response.status != 200) {
        // Reconnect in one second
        await new Promise((resolve) =>
          setTimeout(resolve, ERROR_RECONNECT_SPEED)
        );
        await subscribe(from, signal);
      } else {
        let { messages: newMessages, users } = await response.json();
        let newFrom = from;

        setChatState((prev) => {
          const udpatedMessages = [...prev.messages, ...newMessages];
          newFrom = udpatedMessages.length;
          return { messages: udpatedMessages, users };
        });

        // Call subscribe() again to get the next message
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_SPEED));
        await subscribe(newFrom, signal);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setSubscribeError(true);
        await new Promise((resolve) =>
          setTimeout(resolve, ERROR_RECONNECT_SPEED * 4)
        );
        await subscribe(from, signal);
      }
    }
  }

  async function post(username: string, message: string) {
    fetch(`${NEXT_PUBLIC_CHAT_SERVER_URL}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message }),
    });
    setMessage("");
  }

  useEffect(() => {
    // When we login we need to abort and create a new subscription
    const controller = new AbortController();
    const { signal } = controller;

    subscribe(messages.length, signal);

    return () => {
      controller.abort();
    };
  }, [username]);

  return (
    <>
      <Head>
        <title>Long Poll Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        {subscribeError && (
          <div className="w-full bg-red-500 text-white p-4 text-center text-lg">
            Unable to connect to server.
          </div>
        )}
        <main className="flex min-h-screen">
          <div className="mt-6 flex max-w-xs flex-col sm:w-full border-r-2 border-r-indigo-500">
            <p className="px-2 py-3 text-2xl">Users</p>
            {users.map(({ username, online }) => (
              <div className="flex p-1 items-center">
                <OnlineStatus online={online} />
                <Username username={username} />
              </div>
            ))}
          </div>
          <div className="flex flex-col min-h-fit p-4 sm:w-full">
            {!username && <SignIn setUsername={setUsername} />}
            <div className="grow mt-6">
              {messages.map(({ username, message }) => (
                <div className="flex items-center my-1">
                  <Username username={username} />: {message}
                </div>
              ))}
            </div>
            <div className="w-full self-end">
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                name="message"
                id="message"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Add your message..."
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  disabled={!username}
                  onClick={() => post(username, message)}
                  className="inline-flex items-center rounded-md border disabled:opacity-75 disabled:bg-gray-600 border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex h-24 w-full items-center justify-center border-t">
          <a
            className="flex items-center justify-center gap-2"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{" "}
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </a>
        </footer>
      </div>
    </>
  );
};

export default Polling;
