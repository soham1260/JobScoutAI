import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Building2,
  MapPin,
  Users,
  Briefcase,
  Target,
  Award,
  Zap,
  Activity,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "http://localhost:5000";

const INSIGHTS = [
  {
    id: "industry",
    name: "Industry Heatmap",
    icon: Building2,
    endpoint: "/insights/industry",
  },
  {
    id: "top-companies",
    name: "Top Hiring Companies",
    icon: Award,
    endpoint: "/insights/top-companies",
  },
  {
    id: "competition",
    name: "Job Competition",
    icon: Target,
    endpoint: "/insights/competition",
  },
  {
    id: "jobs-by-city",
    name: "Jobs by City",
    icon: MapPin,
    endpoint: "/insights/jobs-by-city",
  },
  {
    id: "jobs-by-state",
    name: "Jobs by State",
    icon: MapPin,
    endpoint: "/insights/jobs-by-state",
  },
  {
    id: "seniority",
    name: "Seniority Breakdown",
    icon: Users,
    endpoint: "/insights/seniority",
  },
  {
    id: "skills",
    name: "Skills Frequency",
    icon: Zap,
    endpoint: "/insights/skills",
  },
  {
    id: "worktype",
    name: "Work Type Distribution",
    icon: Briefcase,
    endpoint: "/insights/worktype",
  },
  {
    id: "prestige",
    name: "Prestigious Companies",
    icon: Award,
    endpoint: "/insights/prestige",
  },
  {
    id: "flex-index",
    name: "Best Flex-Index Roles",
    icon: Activity,
    endpoint: "/insights/flex-index",
  },
  {
    id: "role-growth",
    name: "Fastest-Growing Roles",
    icon: TrendingUp,
    endpoint: "/insights/role-growth",
  },
  {
    id: "industry-seniority",
    name: "Industry × Seniority",
    icon: BarChart3,
    endpoint: "/insights/industry-seniority",
  },
  {
    id: "best-cities-by-role",
    name: "Best Cities by Role",
    icon: MapPin,
    endpoint: "/insights/best-cities-by-role",
  },
  {
    id: "company-size-per-role",
    name: "Avg Company Size",
    icon: Building2,
    endpoint: "/insights/company-size-per-role",
  },
  {
    id: "industry-worktype",
    name: "Industry Work-Type",
    icon: Briefcase,
    endpoint: "/insights/industry-worktype",
  },
  {
    id: "industry-competition",
    name: "Industry Competition",
    icon: Target,
    endpoint: "/insights/industry-competition",
  },
  {
    id: "city-density",
    name: "City Hiring Density",
    icon: MapPin,
    endpoint: "/insights/city-density",
  },
  {
    id: "role-popularity",
    name: "Role Popularity",
    icon: TrendingUp,
    endpoint: "/insights/role-popularity",
  },
  {
    id: "hiring-consistency",
    name: "Hiring Consistency",
    icon: Activity,
    endpoint: "/insights/hiring-consistency",
  },
];

const CHART_TYPES = [
  { id: "bar", name: "Bar Chart", component: Bar },
  { id: "line", name: "Line Chart", component: Line },
  { id: "pie", name: "Pie Chart", component: Pie },
  { id: "doughnut", name: "Doughnut Chart", component: Doughnut },
  { id: "radar", name: "Radar Chart", component: Radar },
  { id: "polar", name: "Polar Area", component: PolarArea },
];

const COLORS = [
  "rgba(99, 102, 241, 0.8)",
  "rgba(168, 85, 247, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(251, 146, 60, 0.8)",
  "rgba(34, 197, 94, 0.8)",
  "rgba(14, 165, 233, 0.8)",
  "rgba(248, 113, 113, 0.8)",
  "rgba(250, 204, 21, 0.8)",
  "rgba(163, 230, 53, 0.8)",
  "rgba(192, 132, 252, 0.8)",
];

export default function JobScoutAI() {
  const [selectedInsight, setSelectedInsight] = useState(INSIGHTS[0]);
  const [chartType, setChartType] = useState("bar");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ companies: 0, jobs: 0, cities: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedInsight) {
      fetchInsightData();
    }
  }, [selectedInsight]);

  const fetchStats = async () => {
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/companies/all`),
        fetch(`${API_BASE}/jobs/all`),
      ]);
      const companiesData = await companiesRes.json();
      const jobsData = await jobsRes.json();

      const uniqueCities = new Set(
        jobsData.jobs?.map((j) => j.city).filter(Boolean)
      );

      setStats({
        companies: companiesData.companies?.length || 0,
        jobs: jobsData.jobs?.length || 0,
        cities: uniqueCities.size || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchInsightData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${selectedInsight.endpoint}`);
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      setError(
        "Failed to load data. Make sure the backend is running on localhost:5000"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!data) return null;

    let labels = [];
    let values = [];

    if (Array.isArray(data)) {
      labels = data.map((item) => Object.keys(item)[0]);
      values = data.map((item) => Object.values(item)[0]);
    } else if (typeof data === "object") {
      labels = Object.keys(data);
      values = Object.values(data);
    }

    // Limit to top 15 for better visualization
    if (labels.length > 15) {
      labels = labels.slice(0, 15);
      values = values.slice(0, 15);
    }

    return {
      labels,
      datasets: [
        {
          label: selectedInsight.name,
          data: values,
          backgroundColor: COLORS,
          borderColor: COLORS.map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: ["pie", "doughnut", "polar"].includes(chartType),
        position: "right",
        labels: {
          color: "#e5e7eb",
          font: { size: 11 },
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#f3f4f6",
        bodyColor: "#e5e7eb",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: !["pie", "doughnut", "radar", "polar"].includes(chartType)
      ? {
          x: {
            ticks: { color: "#9ca3af", font: { size: 11 } },
            grid: { color: "rgba(75, 85, 99, 0.2)" },
          },
          y: {
            ticks: { color: "#9ca3af", font: { size: 11 } },
            grid: { color: "rgba(75, 85, 99, 0.2)" },
          },
        }
      : undefined,
  };

  const ChartComponent =
    CHART_TYPES.find((t) => t.id === chartType)?.component || Bar;
  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  JobScoutAI
                </h1>
                <p className="text-xs text-gray-400">
                  LinkedIn Job Market Analytics
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600/50">
                <div className="text-xs text-gray-400">Companies</div>
                <div className="text-lg font-bold text-indigo-400">
                  {stats.companies.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600/50">
                <div className="text-xs text-gray-400">Jobs</div>
                <div className="text-lg font-bold text-purple-400">
                  {stats.jobs.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600/50">
                <div className="text-xs text-gray-400">Cities</div>
                <div className="text-lg font-bold text-pink-400">
                  {stats.cities.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 sticky top-24">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Analytics
            </h2>
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              {INSIGHTS.map((insight) => {
                const Icon = insight.icon;
                return (
                  <button
                    key={insight.id}
                    onClick={() => setSelectedInsight(insight)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      selectedInsight.id === insight.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {insight.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6">
            {/* Chart Type Selector */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  {selectedInsight.name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Visual representation of job market data
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      chartType === type.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div
              className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30"
              style={{ height: "600px" }}
            >
              {loading && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading insights...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="h-full flex items-center justify-center">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md">
                    <p className="text-red-400 text-center">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && chartData && (
                <div className="h-full">
                  <ChartComponent data={chartData} options={chartOptions} />
                </div>
              )}

              {!loading && !error && !chartData && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
}
