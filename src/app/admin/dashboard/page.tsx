"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LineChart } from "lucide-react";
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query } from "firebase/firestore";
import type { Visit } from "@/lib/schema";
import { isToday } from "date-fns";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  // This query fetches ALL visits and filters on the client.
  // This resolves the permission error caused by a missing index, but may cause freezing with large data.
  // The permanent fix is to create the index in Firestore and add the 'where' clause back to the query.
  const allVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'visits'));
  }, [firestore]);
  const { data: allVisits, isLoading: visitsLoading } = useCollection<Visit>(allVisitsQuery);

  const todaysVisits = useMemo(() => {
    if (!allVisits) return [];
    return allVisits.filter(visit => isToday(new Date(visit.visitDateTime)));
  }, [allVisits]);

  const todaysVisitorsCount = useMemo(() => {
    return todaysVisits.length;
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
            <div className="text-2xl font-bold">{visitsLoading ? '...' : todaysVisitorsCount}</div>
            <p className="text-xs text-muted-foreground">Logged visits today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour Today</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
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
    </>
  );
}
