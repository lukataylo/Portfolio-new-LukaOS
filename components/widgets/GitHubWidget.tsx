/**
 * GitHub Activity Widget Component
 *
 * Displays a GitHub-style contribution graph and recent activity.
 * Uses simulated data for the portfolio.
 *
 * @module components/widgets/GitHubWidget
 */

import React, { useMemo } from 'react';
import { Github, GitCommit, Star, GitFork } from 'lucide-react';

// Generate simulated contribution data for the last 12 weeks
const generateContributions = (): number[][] => {
  const weeks: number[][] = [];

  for (let week = 0; week < 12; week++) {
    const days: number[] = [];
    for (let day = 0; day < 7; day++) {
      // More contributions on weekdays
      const isWeekend = day === 0 || day === 6;
      const baseChance = isWeekend ? 0.3 : 0.7;
      const hasContribution = Math.random() < baseChance;

      if (hasContribution) {
        // Random contribution count (weighted towards lower numbers)
        const r = Math.random();
        if (r < 0.5) days.push(1);
        else if (r < 0.8) days.push(2);
        else if (r < 0.95) days.push(3);
        else days.push(4);
      } else {
        days.push(0);
      }
    }
    weeks.push(days);
  }

  return weeks;
};

const getContributionColor = (count: number, isDark: boolean): string => {
  if (count === 0) return isDark ? 'bg-zinc-800' : 'bg-zinc-200';
  if (count === 1) return 'bg-green-300 dark:bg-green-900';
  if (count === 2) return 'bg-green-400 dark:bg-green-700';
  if (count === 3) return 'bg-green-500 dark:bg-green-500';
  return 'bg-green-600 dark:bg-green-400';
};

export const GitHubWidget: React.FC = () => {
  // Memoize contributions so they don't change on every render
  const contributions = useMemo(() => generateContributions(), []);

  // Calculate total contributions
  const totalContributions = useMemo(() => {
    return contributions.flat().reduce((sum, count) => sum + count, 0);
  }, [contributions]);

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-lg w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Github size={16} className="text-zinc-600 dark:text-zinc-400" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
            lukataylo
          </span>
        </div>
        <a
          href="https://github.com/lukataylo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-500 hover:text-blue-600"
        >
          View Profile
        </a>
      </div>

      {/* Contribution Graph */}
      <div className="flex gap-0.5 mb-3">
        {contributions.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((count, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-2 h-2 rounded-sm ${getContributionColor(count, false)}`}
                title={`${count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="text-[10px] text-zinc-500 mb-3">
        {totalContributions} contributions in the last 12 weeks
      </div>

      {/* Activity Items */}
      <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          <GitCommit size={12} className="text-green-500" />
          <span className="text-zinc-600 dark:text-zinc-400 truncate">
            Pushed to Portfolio-new
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Star size={12} className="text-yellow-500" />
          <span className="text-zinc-600 dark:text-zinc-400 truncate">
            Starred react-spring
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <GitFork size={12} className="text-blue-500" />
          <span className="text-zinc-600 dark:text-zinc-400 truncate">
            Forked tailwindcss
          </span>
        </div>
      </div>
    </div>
  );
};
