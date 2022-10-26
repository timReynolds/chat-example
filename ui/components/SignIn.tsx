import { useState } from "react";

interface SignInProps {
  setUsername: (username: string) => void;
}

const SignIn = ({ setUsername }: SignInProps) => {
  const [localUsername, setLocalUsername] = useState("");
  return (
    <div className="bg-indigo-700">
      <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="block">Enter username</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-indigo-200">
          To get realtime updates and post!
        </p>
        <div className="mt-4 px-4">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
            type="username"
            name="username"
            id="username"
            className="block p-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="username..."
          />
        </div>
        <button
          onClick={() => setUsername(localUsername.toLowerCase())}
          disabled={!localUsername}
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50 sm:w-auto"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default SignIn;
