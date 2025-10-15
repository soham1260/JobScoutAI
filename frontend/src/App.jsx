import React, { useState } from "react";
import { BarChart3 } from "lucide-react";

const INSIGHTS = [
  { id: "industry", name: "Industry Heatmap" },
  { id: "top-companies", name: "Top Hiring Companies" },
  { id: "competition", name: "Job Competition" },
];

export default function JobScoutAI() {
  const [selectedInsight, setSelectedInsight] = useState(INSIGHTS[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            JobScoutAI
          </h1>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        <aside className="w-64">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">
              Analytics
            </h2>
            {INSIGHTS.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelectedInsight(i)}
                className={`w-full px-3 py-2 rounded-lg mb-1 ${
                  selectedInsight.id === i.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {i.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100">
            {selectedInsight.name}
          </h2>
        </main>
      </div>
    </div>
  );
}
