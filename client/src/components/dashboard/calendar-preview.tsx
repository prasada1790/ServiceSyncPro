import { useState } from "react";
import { format, addMonths, isSameDay, isSameMonth, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RenewalWithRelations } from "@shared/schema";
import { Link } from "wouter";

interface CalendarPreviewProps {
  renewals: RenewalWithRelations[];
  isLoading?: boolean;
}

export function CalendarPreview({ renewals = [], isLoading = false }: CalendarPreviewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Process renewals for calendar display
  const endDates = renewals.map(renewal => ({
    date: new Date(renewal.endDate),
    isPaid: renewal.isPaid,
    daysRemaining: Math.ceil(
      (new Date(renewal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  }));

  // Custom renderer for calendar days
  const renderDay = (day: Date) => {
    // Find any renewals ending on this day
    const renewalsOnDay = endDates.filter(d => isSameDay(d.date, day));
    
    if (renewalsOnDay.length === 0) return null;
    
    // Get the most urgent renewal for coloring
    const mostUrgent = renewalsOnDay.reduce((prev, current) => {
      if (current.isPaid) return prev;
      if (prev.isPaid) return current;
      return current.daysRemaining < prev.daysRemaining ? current : prev;
    }, renewalsOnDay[0]);
    
    if (mostUrgent.isPaid) {
      return <div className="w-full h-full rounded-md bg-green-100"></div>;
    } else if (mostUrgent.daysRemaining <= 15) {
      return <div className="w-full h-full rounded-md bg-yellow-100"></div>;
    } else {
      return <div className="w-full h-full rounded-md bg-blue-100"></div>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Calendar</CardTitle>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Calendar</CardTitle>
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100">
              Full View
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={new Date()}
          className="border-none"
          components={{
            Day: ({ date, ...props }) => {
              const dayContent = renderDay(date);
              return <div {...props}>{dayContent}</div>;
            }
          }}
          disabled={(date) => !isSameMonth(date, currentMonth)}
        />

        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="text-xs">Due soon (within 15 days)</div>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
            <div className="text-xs">Upcoming renewals</div>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <div className="text-xs">Paid renewals</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
