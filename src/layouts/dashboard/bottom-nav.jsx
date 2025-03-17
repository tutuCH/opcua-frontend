import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import navConfig from "./config-navigation";

// Wrapped in React.memo to avoid unnecessary re-renders on mobile.
export const BottomNav = React.memo(() => {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background dark:bg-slate-950 z-50">
      <nav className="flex justify-around p-3 pb-8">
        {navConfig.map((item) => {
          const isActive = pathname === item.path;
          const classes = cn(
            "flex flex-col items-center gap-2 px-2 bg-transparent shadow-none hover:bg-transparent",
            isActive
              ? "text-primary dark:text-primary"
              : "text-muted-foreground dark:text-slate-400"
          );
          return (
            <Link key={item.path} to={item.path}>
              <div role="button" className={classes}>
                {item.icon}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

BottomNav.displayName = "BottomNav";
