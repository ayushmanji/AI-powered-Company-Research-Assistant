import React from "react";
import { APP_NAME } from "@/lib/constants";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
      </div>
    </header>
  );
};
