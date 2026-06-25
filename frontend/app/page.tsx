"use client";

import { useState } from "react";

import Navbar from "./components/Navbar";
import UploadSection from "./components/UploadSection";
import SearchSection from "./components/SearchSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-950
        via-slate-900
        to-slate-800
        text-white
      "
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="px-4 py-6">
        {activeTab === "upload" && <UploadSection />}
        {activeTab === "search" && <SearchSection />}
      </div>
    </main>
  );
}