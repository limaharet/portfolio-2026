"use client";
import React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, GitBranch, GitCommit, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  username: string;
}
interface GithubStats {
  user: {
    totalContribution: number;
  };
  contributions: {
    count: number;
    date: string;
  }[];
}

const GithubStats = ({ username }: Props) => {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}`,
        );

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        setStats({
          user: {
            totalContribution: data.total[new Date().getFullYear()],
          },
          /* eslint-disable @typescript-eslint/no-explicit-any */
          contributions: data.contributions.map((day: any) => ({
            count: day.count,
            date: day.date,
          })),
        });
      } catch (error) {
        setError("failed to fetch github stats");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGithubStats();
  }, [username]);

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 bg-card border-border/5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded " />
          <div className="h-32 bg-muted rounded " />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6 bg-card border-border/5">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (!stats) return null;

  // // Calculate current streak
  const currentStreak = stats.contributions
    .slice()
    .reverse()
    .reduce((streak, day, index) => {
      if (index === 0 && day.count === 0) return 0;
      if (day.count > 0) return streak + 1;

      return streak;
    }, 0);

  // // Calculate max contributions in a day
  const maxContributions = Math.max(
    ...stats.contributions.map((day) => day.count),
  );

  // // CAlculate contribution levels
  const getContributionLevel = (count: number) => {
    if (count === 0) return "bg-muted";
    const percentage = (count / maxContributions) * 100;

    if (percentage <= 25) return "bg-primary/30";
    if (percentage <= 50) return "bg-primary/50";
    if (percentage <= 75) return "bg-primary/70";

    return "bg-primary";
  };

  const today = new Date();
  const toDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const contributionCounts = new Map(
    stats.contributions.map((day) => [day.date, day.count]),
  );
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(
      today.getFullYear(),
      today.getMonth() - (5 - index),
      1,
    );
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const lastDay =
      month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear()
      ? today.getDate()
      : daysInMonth;

    return {
      date: month,
      days: Array.from({ length: lastDay }, (_, dayIndex) => {
        const date = new Date(
          month.getFullYear(),
          month.getMonth(),
          dayIndex + 1,
        );
        const dateKey = toDateKey(date);

        return {
          date: dateKey,
          count: contributionCounts.get(dateKey) ?? 0,
        };
      }),
    };
  });

  return (
    <Card className="p-4 sm:p-6 lg:p-8 bg-card border-border/5 backdrop-blur-sm overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 sm:space-y-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <GitCommit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">
            Contribution Activity
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-secondary/50 backdrop-blur-sm"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {" "}
              {currentStreak} days
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-secondary/50 backdrop-blur-sm"
          >
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Total Contributions in {new Date().getFullYear()}
            </p>
            <p className="text-xl sm:text-2xl font-bold">
              {stats?.user?.totalContribution?.toLocaleString?.() ?? "0"}
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-secondary/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Best Day</p>
            <p className="text-xl sm:text-2xl font-bold">
              {maxContributions} commits
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Last 6 months GitHub Contributions
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Less</span>
              {[
                "bg-muted",
                "bg-primary/30",
                "bg-primary/50",
                "bg-primary/70",
                "bg-primary",
              ].map((level) => (
                <span
                  key={level}
                  className={cn("h-3 w-3 rounded-[3px]", level)}
                />
              ))}
              <span>More</span>
            </div>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {months.map(({ date, days }) => (
                <div
                  key={`${date.getFullYear()}-${date.getMonth()}`}
                  className="rounded-lg border border-border/50 bg-secondary/20 p-3 sm:p-4"
                >
                  <h5 className="mb-3 text-sm font-medium">
                    {date.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map(
                      (weekday, index) => (
                        <span
                          key={`${weekday}-${index}`}
                          className="pb-1 text-center text-[10px] text-muted-foreground"
                        >
                          {weekday}
                        </span>
                      ),
                    )}
                    {Array.from({
                      length: new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1,
                      ).getDay(),
                    }, (_, index) => (
                      <span key={`empty-${index}`} aria-hidden="true" />
                    ))}
                    {days.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger
                          aria-label={`${day.count} contributions on ${day.date}`}
                          className={cn(
                            "aspect-square w-full rounded-[3px] transition-colors hover:ring-1 hover:ring-primary/70",
                            getContributionLevel(day.count),
                          )}
                        />
                        <TooltipContent>
                          <p className="text-xs font-semibold text-black">
                            {day.count} contributions on{" "}
                            {new Date(
                              `${day.date}T00:00:00`,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </motion.div>
    </Card>
  );
};

export default GithubStats;
