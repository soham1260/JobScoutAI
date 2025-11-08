import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

const API_BASE = "http://localhost:5000";

const INSIGHTS = [
  { id: "industry", name: "Industry Heatmap" },
  { id: "top-companies", name: "Top Hiring Companies" },
  { id: "competition", name: "Job Competition" },
];

export default function JobScoutAI() {
  const [selectedInsight, setSelectedInsight] = useState(INSIGHTS[0]);
  const [stats, setStats] = useState({ companies: 0, jobs: 0, cities: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/companies/all`),
        fetch(`${API_BASE}/jobs/all`),
      ]);

      const companiesData = await companiesRes.json();
      const jobsData = await jobsRes.json();

      const cities = new Set(jobsData.jobs?.map((j) => j.city).filter(Boolean));

      setStats({
        companies: companiesData.companies.length,
        jobs: jobsData.jobs.length,
        cities: cities.size,
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              JobScoutAI
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">Companies</div>
              <div className="text-lg font-bold text-indigo-400">
                {stats.companies}
              </div>
            </div>

            <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">Jobs</div>
              <div className="text-lg font-bold text-purple-400">
                {stats.jobs}
              </div>
            </div>

            <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">Cities</div>
              <div className="text-lg font-bold text-pink-400">
                {stats.cities}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        {/* Sidebar */}
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

        {/* Main */}
        <main className="flex-1 bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold">{selectedInsight.name}</h2>
        </main>
      </div>
    </div>
  );
}
