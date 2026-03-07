"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, LogIn } from "lucide-react";
import { format, getMonth } from 'date-fns';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import type { UserProfile, Visit } from "@/lib/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'user_profiles', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const visitsRef = useMemoFirebase(() => user ? query(collection(firestore, 'user_profiles', user.uid, 'visits'), orderBy('visitDateTime', 'desc')) : null, [firestore, user]);
  const { data: userVisits, isLoading: areVisitsLoading } = useCollection<Visit>(visitsRef);
  
  const visitsThisMonth = userVisits?.filter(v => getMonth(new Date(v.visitDateTime)) === getMonth(new Date())).length ?? 0;

  return (
    <>
      <div className="mb-6">
        {isProfileLoading ? (
          <Skeleton className="h-9 w-1/2" />
        ) : (
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Student'}!
          </h1>
        )}
        <p className="text-muted-foreground">Here's your library activity overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visits This Month
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{areVisitsLoading ? <Skeleton className="h-8 w-10"/> : visitsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              in {format(new Date(), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Visits
            </CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{areVisitsLoading ? <Skeleton className="h-8 w-10"/> : userVisits?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Since your first visit
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
          <CardDescription>A log of your most recent library entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Purposes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areVisitsLoading && <TableRow><TableCell colSpan={3} className="text-center">Loading visits...</TableCell></TableRow>}
              {userVisits?.slice(0, 5).map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{format(new Date(visit.visitDateTime), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(visit.visitDateTime), 'p')}</TableCell>
                  <TableCell>{visit.purposeIds.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
