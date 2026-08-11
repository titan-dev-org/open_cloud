"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-600/10",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-600/10",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-600/10",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-600/10",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-600/10",
  },
};

export function StatsCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  trend,
  color = "blue" 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">dari bulan lalu</span>
            </div>
          )}
          
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={`p-3 ${colorClasses[color].bg} rounded-lg ${colorClasses[color].text} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
  }
