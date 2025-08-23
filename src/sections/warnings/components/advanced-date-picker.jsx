"use client"

import * as React from "react"
import { addDays, format, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "src/components/ui/button"
import { Calendar } from "src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select"
import { cn } from "@/lib/utils"

export default function AdvancedDatePicker({ className, onRangeChange }) {
  const [date, setDate] = React.useState({
    from: new Date(),
    to: new Date(),
  })

  const handlePresetChange = (value) => {
    let newRange = {};
    const today = new Date();

    switch (value) {
      case "today":
        newRange = { from: today, to: today };
        break;
      case "past3days":
        newRange = { from: subDays(today, 2), to: today };
        break;
      case "pastweek":
        newRange = { from: subDays(today, 6), to: today };
        break;
      case "custom":
        // Keep current selection for custom
        return;
      default:
        return;
    }

    setDate(newRange);
  };

  React.useEffect(() => {
    if (onRangeChange && date?.from && date?.to) {
      onRangeChange(date);
    }
  }, [date, onRangeChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-2 space-y-2">
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="past3days">Past 3 days</SelectItem>
                <SelectItem value="pastweek">Past week</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="w-24 m-5"
              onClick={() => {
                onRangeChange(date);
              }}
            >
              Submit
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 