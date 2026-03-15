"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LineChart } from "lucide-react";
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where } from "firebase/firestore";
import { Visit } from "@/lib/schema";
import { startOfToday } from "date-fns";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const todaysVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const todayStart = startOfToday();
    return query(
        collectionGroup(firestore, 'visits'),
        where('visitDateTime', '>=', todayStart.toISOString())
    );
  }, [firestore]);
  const { data: todaysVisits, isLoading: todaysVisitsLoading } = useCollection<Visit>(todaysVisitsQuery);

  const todaysVisitorsCount = useMemo(() => {
    return todaysVisits?.length ?? 0;
  }, [todaysVisits]);

  const peakHourToday = useMemo(() => {
    if (!todaysVisits || todaysVisits.length === 0) {
      return { hour: 'N/A', count: 0 };
    }

    const hourCounts = todaysVisits.reduce((acc, visit) => {
        const hour = new Date(visit.visitDateTime).getHours(); // 0-23
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    let peakHour = -1;
    let maxVisits = 0;
    for (const hour in hourCounts) {
        if (hourCounts[hour] > maxVisits) {
            maxVisits = hourCounts[hour];
            peakHour = parseInt(hour, 10);
        }
    }
    
    if (peakHour === -1) {
      return { hour: 'N/A', count: 0 };
    }

    const ampm = peakHour >= 12 ? 'PM' : 'AM';
    let displayHour = peakHour % 12;
    if (displayHour === 0) displayHour = 12;

    return {
        hour: `${displayHour}:00 ${ampm}`,
        count: maxVisits
    };
  }, [todaysVisits]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, Jeremias!</h1>
        <p className="text-muted-foreground">Real-time library analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysVisitsLoading ? '...' : todaysVisitorsCount}</div>
            <p className="text-xs text-muted-foreground">Logged visits today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour Today</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {todaysVisitsLoading ? (
              <>
                <div className="text-2xl font-bold">...</div>
                <p className="text-xs text-muted-foreground">Calculating...</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{peakHourToday.hour}</div>
                <p className="text-xs text-muted-foreground">
                  {peakHourToday.count > 0
                    ? `With ${peakHourToday.count} visitors`
                    : "No visits today"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Performance Update</CardTitle>
            <CardDescription>Historical analytics have been temporarily disabled to resolve application freezing.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                The dashboard was freezing because it was attempting to load and process a very large amount of historical data in your browser. To provide a fast and stable experience, the dashboard now only displays real-time statistics for today.
            </p>
            <br/>
            <p className="text-sm text-muted-foreground">
                A permanent solution for displaying historical data efficiently requires server-side data processing, which can be implemented as a next step.
            </p>
        </CardContent>
      </Card>

    </>
  );
}
