import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-background border rounded-lg shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background p-0 hover:bg-accent hover:text-accent-foreground border-input shadow-sm"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse mt-2",
        head_row: "flex mb-2",
        head_cell: "text-muted-foreground rounded-md w-10 font-medium text-sm text-center py-2 uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-all duration-200 border-0 bg-transparent"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-medium shadow-sm",
        day_today: "bg-accent text-accent-foreground font-semibold border border-primary/20",
        day_outside: "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-50 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };