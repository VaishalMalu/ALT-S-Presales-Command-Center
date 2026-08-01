import React, { useEffect, useState, useMemo } from "react";
import { getOpportunities } from "../../lib/api/opportunities";
import { getAccounts } from "../../lib/api/accounts";
import { getTasks } from "../../lib/api/tasks";
import { Opportunity, Account, Task } from "@repo/db";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOpportunities(), getAccounts(), getTasks()])
      .then(([opps, accs, tsks]) => {
        setOpportunities(opps);
        setAccounts(accs);
        setTasks(tsks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        // Even if it fails, stop loading so we can see an empty dashboard or error state
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const weightedPipeline = opportunities
      .filter((o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost")
      .reduce(
        (s, o) =>
          s + (Number(o.deal_value) || 0) * (Number(o.probability) || 0),
        0,
      );
    const totalArr = accounts.reduce((s, a) => s + (Number(a.arr) || 0), 0);
    const openTasks = tasks.filter((t) => t.status !== "Completed").length;

    let overdue = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOverdue = (dateStr?: string | null) => {
      if (!dateStr) return false;
      return new Date(dateStr) < today;
    };

    opportunities.forEach((o) => {
      if (
        o.stage !== "Closed Won" &&
        o.stage !== "Closed Lost" &&
        checkOverdue(o.deadline)
      )
        overdue++;
    });
    tasks.forEach((t) => {
      if (t.status !== "Completed" && checkOverdue(t.due_date)) overdue++;
    });
    accounts.forEach((a) => {
      if (
        a.health_score !== null &&
        a.health_score < 80 &&
        checkOverdue(a.renewal_date)
      )
        overdue++;
    });

    return {
      weightedPipeline: `$${(weightedPipeline / 1000000).toFixed(1)}M`,
      totalArr: `$${(totalArr / 1000000).toFixed(1)}M`,
      openTasks: String(openTasks),
      overdue: String(overdue),
    };
  }, [opportunities, accounts, tasks]);

  const upcoming = useMemo(() => {
    const list: { label: string; days: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const getDays = (dateStr?: string | null) => {
      if (!dateStr) return null;
      return Math.round(
        (new Date(dateStr).getTime() - today.getTime()) / 86400000,
      );
    };

    opportunities.forEach((o) => {
      if (o.stage !== "Closed Won" && o.stage !== "Closed Lost") {
        const d = getDays(o.deadline);
        if (d !== null && d >= 0 && d <= 14)
          list.push({ label: `${o.title} — RFP deadline`, days: d });
      }
    });
    tasks.forEach((t) => {
      if (t.status !== "Completed") {
        const d = getDays(t.due_date);
        if (d !== null && d >= 0 && d <= 14)
          list.push({ label: `${t.title} — Task due`, days: d });
      }
    });
    accounts.forEach((a) => {
      const d = getDays(a.renewal_date);
      if (d !== null && d >= 0 && d <= 14)
        list.push({ label: `${a.name} — Renewal`, days: d });
    });
    return list.sort((a, b) => a.days - b.days);
  }, [opportunities, accounts, tasks]);

  // Global Chart Configuration for Clean Professional Look
  ChartJS.defaults.font.family = "'Inter', 'Segoe UI', Roboto, sans-serif";
  ChartJS.defaults.color = "#64748B";

  const commonTooltip = {
    backgroundColor: "#ffffff",
    titleColor: "#0f172a",
    bodyColor: "#334155",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: 10,
    cornerRadius: 4,
    displayColors: true,
    boxPadding: 4,
    usePointStyle: true,
    titleFont: { size: 13, weight: "bold" as const },
    bodyFont: { size: 13 },
  };

  const stageLabels = [
    "Lead Created",
    "Customer Qualification",
    "Solution Design",
    "Proposal/RFP Submitted",
    "Closed Won",
    "Closed Lost",
  ];
  const stageCounts = stageLabels.map(
    (label) => opportunities.filter((o) => o.stage === label).length,
  );

  const stageChartData = {
    labels: stageLabels,
    datasets: [
      {
        data: stageCounts,
        backgroundColor: "#2563EB", // Standard Professional Blue
        borderRadius: 4,
        barPercentage: 0.5,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: commonTooltip,
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.04)",
          drawBorder: false,
          borderDash: [5, 5],
        },
        ticks: { font: { weight: "500" as const }, color: "#475569" },
      },
    },
  };

  const healthLabels = ["Green", "Yellow", "Red"];
  const healthCounts = [
    accounts.filter((a) => (a.health_score || 0) >= 80).length,
    accounts.filter(
      (a) => (a.health_score || 0) >= 50 && (a.health_score || 0) < 80,
    ).length,
    accounts.filter((a) => (a.health_score || 0) < 50).length,
  ];

  const healthChartData = {
    labels: healthLabels,
    datasets: [
      {
        data: healthCounts,
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"], // Clean tailwind standard colors
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const entityTotals: Record<string, number> = {};
  opportunities.forEach((o) => {
    if (o.stage !== "Closed Won" && o.stage !== "Closed Lost") {
      const key = o.driven_by || "Unspecified";
      entityTotals[key] =
        (entityTotals[key] || 0) +
        (Number(o.deal_value) || 0) * (Number(o.probability) || 0);
    }
  });
  const entityLabels = Object.keys(entityTotals);
  const entityData = entityLabels.map((k) => entityTotals[k]);

  const cleanPalette = [
    "#3B82F6",
    "#8B5CF6",
    "#14B8A6",
    "#F59E0B",
    "#6366F1",
    "#EC4899",
    "#64748B",
  ];
  const entityChartData = {
    labels: entityLabels,
    datasets: [
      {
        data: entityData,
        backgroundColor: cleanPalette.slice(0, entityLabels.length),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: "65%", // Standard thickness
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle" as const,
          font: { size: 12 },
        },
      },
      tooltip: commonTooltip,
    },
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <div className="space-y-6 pb-12 bg-gray-50 min-h-screen -m-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your pipeline and active operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Weighted Pipeline",
            value: stats.weightedPipeline,
            isRisk: false,
          },
          { label: "Total ARR", value: stats.totalArr, isRisk: false },
          { label: "Open Tasks", value: stats.openTasks, isRisk: false },
          {
            label: "Overdue Items",
            value: stats.overdue,
            isRisk: Number(stats.overdue) > 0,
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className={`bg-white rounded-lg shadow-sm border ${kpi.isRisk ? "border-red-200" : "border-gray-200"} p-5 flex flex-col justify-between`}
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {kpi.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl font-bold ${kpi.isRisk ? "text-red-600" : "text-gray-900"}`}
              >
                {kpi.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-semibold mb-6 text-gray-800">
            Pipeline by Stage
          </h3>
          <div className="flex-1 min-h-[240px] relative">
            <Bar data={stageChartData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-semibold mb-6 text-gray-800">
            Accounts by Health
          </h3>
          <div className="flex-1 min-h-[240px] relative">
            <Doughnut data={healthChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[340px]">
          <h3 className="text-sm font-semibold mb-6 text-gray-800">
            Pipeline by Entity
          </h3>
          <div className="flex-1 min-h-[240px] relative">
            <Doughnut data={entityChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-800">
          Upcoming in Next 14 Days
        </h3>
        <div className="space-y-1">
          {upcoming.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              No upcoming items.
            </div>
          ) : (
            upcoming.map((u, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors"
              >
                <span className="text-gray-700 text-sm">{u.label}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.days <= 7
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {u.days} {u.days === 1 ? "day" : "days"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
