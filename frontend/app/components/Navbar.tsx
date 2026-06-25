"use client";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <nav className="
      sticky
      top-0
      z-50
      bg-slate-950/70
      backdrop-blur-md
      border-b
      border-slate-800
    ">
      <div className="
        max-w-7xl
        mx-auto
        px-8
        h-16
        flex
        items-center
        justify-between
      ">
        <h1 className="
          text-2xl
          font-bold
          text-white
        ">
          Resume Search ATS
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => setActiveTab("upload")}
            className={`
              px-4 py-2 rounded-lg
              transition
              text-sm font-medium
              ${
                activeTab === "upload"
                  ? "bg-white text-black shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }
            `}
          >
            Upload
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`
              px-4 py-2 rounded-lg
              transition
              text-sm font-medium
              ${
                activeTab === "search"
                  ? "bg-white text-black shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }
            `}
          >
            Search
          </button>

        </div>
      </div>
    </nav>
  );
}