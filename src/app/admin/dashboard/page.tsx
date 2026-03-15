"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LogIn, LineChart, Building, BookOpen } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where, orderBy } from "firebase/firestore";
import { UserProfile } from "@/lib/schema";
import { Visit } from "@/lib/schema";
import { format, isToday, subDays, startOfDay } from "date-fns";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  // --- OPTIMIZED QUERIES ---

  // 1. Query for today's visits for the top cards
  const todayStart = useMemo(() => startOfDay(new Date()).toISOString(), []);
  const todaysVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'visits'), where('visitDateTime', '>=', todayStart));
  }, [firestore, todayStart]);
  const { data: todaysVisits, isLoading: todaysVisitsLoading } = useCollection<Visit>(todaysVisitsQuery);

  // 2. Query for the last 30 days for the charts and historical stats
  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30).toISOString(), []);
  const recentVisitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collectionGroup(firestore, 'visits'), 
        where('visitDateTime', '>=', thirtyDaysAgo),
        orderBy('visitDateTime', 'desc')
    );
  }, [firestore, thirtyDaysAgo]);
  const { data: recentVisits, isLoading: recentVisitsLoading } = useCollection<Visit>(recentVisitsQuery);

  const isLoading = usersLoading || todaysVisitsLoading || recentVisitsLoading;

  // --- CALCULATIONS using OPTIMIZED data ---

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

  const collegeVisitCounts = useMemo(() => {
    if (!users || !recentVisits) return [];
    const userAffiliationMap = new Map(users.map(u => [u.id, u.affiliation]));
    const counts = recentVisits.reduce((acc, visit) => {
        let affiliation = userAffiliationMap.get(visit.userId);
        if (affiliation && affiliation !== 'Unknown') {
            if (affiliation === 'College of Computer Studies') {
                affiliation = 'College of Informatics and Computing Studies';
            }
            acc[affiliation] = (acc[affiliation] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
        .map(([affiliation, count]) => ({ affiliation, count }))
        .sort((a, b) => b.count - a.count);
  }, [users, recentVisits]);

  const visitPurposeCounts = useMemo(() => {
    if (!recentVisits) return [];
    const counts = recentVisits.flatMap(visit => visit.purposeIds).reduce((acc, purpose) => {
        acc[purpose] = (acc[purpose] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
        .map(([purpose, count]) => ({ purpose, count }))
        .sort((a, b) => b.count - a.count);
  }, [recentVisits]);

  const dailyStats = useMemo(() => {
    if (!recentVisits) return [];
    const stats = recentVisits.reduce((acc, visit) => {
      const dateKey = format(new Date(visit.visitDateTime), 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
        .map(([dateKey, visitors]) => ({
            date: format(new Date(dateKey), 'MMM d'),
            fullDate: dateKey,
            visitors,
        }))
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [recentVisits]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, Jeremias!</h1>
        <p className="text-muted-foreground">Real-time library analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersLoading ? '...' : (users?.length ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
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

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Statistics</CardTitle>
            <CardDescription>Daily visitor counts over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
                visitors: { label: "Visitors", color: "hsl(var(--primary))" },
            }} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-rows-2 gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Visits by College</CardTitle>
                        <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Distribution of visitors in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? "Loading..." : collegeVisitCounts.map(({ affiliation, count }) => (
                        <div key={affiliation} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{affiliation}</span>
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Top Visit Purposes</CardTitle>
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Most common reasons for visiting in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? "Loading..." : visitPurposeCounts.map(({ purpose, count }) => (
                        <div key={purpose} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{purpose}</span>
                            <span className="font-semibold">{count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
