"use client";

import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function Home() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base text-gray-600">
          {APP_DESCRIPTION}
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex gap-3 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter company name..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
