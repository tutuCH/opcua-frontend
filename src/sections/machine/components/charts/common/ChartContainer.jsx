"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { cn } from "src/lib/utils"

/**
 * Common chart container component providing consistent styling and layout
 */
export default function ChartContainer({ 
  title, 
  description, 
  children, 
  className,
  height = 400,
  loading = false,
  error = null,
  actions = null,
  compact = false
}) {
  const containerHeight = compact ? Math.min(height, 250) : height;

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className={compact ? "text-base" : undefined}>{title}</CardTitle>
          {description && !compact && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={compact ? "pt-2" : undefined}>
          <div 
            className="flex items-center justify-center bg-muted/50 rounded-md"
            style={{ height: containerHeight }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading chart data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className={compact ? "text-base" : undefined}>{title}</CardTitle>
          {description && !compact && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={compact ? "pt-2" : undefined}>
          <div 
            className="flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-md"
            style={{ height: containerHeight }}
          >
            <div className="text-center space-y-2">
              <div className="w-8 h-8 mx-auto text-destructive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className="text-sm text-destructive font-medium">Chart Error</div>
              <div className="text-xs text-muted-foreground max-w-xs">
                {typeof error === 'string' ? error : 'Failed to load chart data'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        compact ? "pb-2" : "pb-2"
      )}>
        <div>
          <CardTitle className={compact ? "text-base" : undefined}>{title}</CardTitle>
          {description && !compact && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className={compact ? "pt-2" : undefined}>
        <div style={{ height: containerHeight }} className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}