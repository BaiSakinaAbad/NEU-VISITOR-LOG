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
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { UserProfile } from "@/lib/schema";
import { Visit } from "@/lib/schema";
import { format, isToday } from "date-fns";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const visitsQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'visits')) : null, [firestore]);
  const { data: visits, isLoading: visitsLoading } = useCollection<Visit>(visitsQuery);

  const todaysVisitors = useMemo(() => {
    if (!visits) return 0;
    return visits.filter(v => isToday(new Date(v.visitDateTime))).length;
  }, [visits]);

  const collegeVisitCounts = useMemo(() => {
    if (!users || !visits) return [];
    const userAffiliationMap = new Map(users.map(u => [u.id, u.affiliation]));
    const counts = visits.reduce((acc, visit) => {
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
  }, [users, visits]);

  const visitPurposeCounts = useMemo(() => {
    if (!visits) return [];
    const counts = visits.flatMap(visit => visit.purposeIds).reduce((acc, purpose) => {
        acc[purpose] = (acc[purpose] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
        .map(([purpose, count]) => ({ purpose, count }))
        .sort((a, b) => b.count - a.count);
  }, [visits]);

  const dailyStats = useMemo(() => {
    if (!visits) return [];
    const stats = visits.reduce((acc, visit) => {
      const date = format(new Date(visit.visitDateTime), 'MMM d');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([date, visitors]) => ({ date, visitors })).slice(-30);
  }, [visits]);

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
            <div className="text-2xl font-bold">{visitsLoading ? '...' : todaysVisitors}</div>
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
            <div className="text-2xl font-bold">2:00 PM</div>
            <p className="text-xs text-muted-foreground">With 45 concurrent visitors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Statistics</CardTitle>
            <CardDescription>Daily visitor counts for the last 30 days.</CardDescription>
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
                    <CardDescription>Distribution of visitors across different colleges.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {collegeVisitCounts.map(({ affiliation, count }) => (
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
                    <CardDescription>Most common reasons for visiting the library.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {visitPurposeCounts.map(({ purpose, count }) => (
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
