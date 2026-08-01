import React, { useEffect, useState, useCallback } from "react";
import { getTasks } from "../../lib/api/tasks";
import { Task } from "@repo/db";
import Drawer from "../components/Drawer";
import TaskForm from "../components/TaskForm";
import { DeadlineBadge, RagBadge, daysUntil } from "../components/ui-utils";
import { Plus, Tag, AlertCircle } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenDrawer = (task?: Task) => {
    setEditingTask(task || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTask(null);
  };

  const handleFormSuccess = () => {
    handleCloseDrawer();
    fetchTasks();
  };

  const columns = [
    {
      id: "Not Started",
      label: "Not Started",
      matchStatuses: ["Not Started"],
      color: "text-gray-500",
    },
    {
      id: "In Progress",
      label: "In Progress",
      matchStatuses: ["In Progress"],
      color: "text-blue-600",
    },
    {
      id: "Bottlenecks",
      label: "Bottlenecks",
      matchStatuses: ["Waiting Customer", "Waiting Internal", "Blocked"],
      color: "text-orange-600",
    },
    {
      id: "Done",
      label: "Done",
      matchStatuses: ["Completed"],
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6 h-full min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your pre-sales tasks and follow-ups.
          </p>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium text-sm flex items-center gap-2"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            Loading tasks...
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-danger bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 items-start flex-1">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) =>
              col.matchStatuses.includes(t.status),
            );
            return (
              <div
                key={col.id}
                className="flex-none w-[320px] bg-gray-50/50 rounded-xl flex flex-col max-h-full border border-gray-100"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100/80">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${col.color.replace("text-", "bg-")}`}
                    ></div>
                    <span className="font-semibold text-sm text-gray-700">
                      {col.label}
                    </span>
                  </div>
                  <span className="bg-gray-200/60 text-gray-600 rounded-md px-2 py-0.5 text-xs font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-3 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenDrawer(task)}
                        className="bg-white border border-gray-200 rounded-lg p-3.5 text-sm cursor-pointer hover:shadow-sm hover:border-blue-300 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <RagBadge status={task.priority} />
                          <DeadlineBadge days={daysUntil(task.due_date)} />
                        </div>
                        <div className="font-semibold text-gray-900 mt-1 mb-1.5 leading-snug group-hover:text-blue-700 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                          <Tag size={12} className="opacity-70" />
                          {task.category || "—"}
                        </div>
                        {col.id === "Bottlenecks" && task.bottleneck_type && (
                          <div className="text-[11px] text-orange-700 font-medium mb-3 bg-orange-50 border border-orange-100 inline-flex items-center gap-1 px-2 py-1 rounded-md">
                            <AlertCircle size={12} />
                            Blocker: {task.bottleneck_type}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {task.opportunity_id && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              Opp: {task.opportunity_id.substring(0, 6)}...
                            </span>
                          )}
                          {task.account_id && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              Acc: {task.account_id.substring(0, 6)}...
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingTask ? "Edit Task" : "Add Task"}
      >
        <TaskForm
          initialData={editingTask}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseDrawer}
        />
      </Drawer>
    </div>
  );
}
