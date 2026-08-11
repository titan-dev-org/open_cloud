"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
};

export function StatsCard({ title, value, icon, subtitle, color = "blue" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 truncate">{title}</p>
          <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 md:p-3 ${colorClasses[color].bg} rounded-lg ${colorClasses[color].text} flex-shrink-0 ml-2`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
