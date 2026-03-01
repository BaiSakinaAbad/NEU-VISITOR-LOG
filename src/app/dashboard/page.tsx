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
import { CalendarDays, Users, LogIn } from "lucide-react";
import { mockVisits, mockUsers } from "@/lib/data";
import { format } from 'date-fns';

export default function DashboardPage() {
  const currentUser = mockUsers[0];
  const userVisits = mockVisits.filter(v => v.userId === currentUser.id);

  const visitsThisMonth = userVisits.filter(v => new Date(v.date).getMonth() === new Date().getMonth()).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here's your library activity overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visits This Month
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitsThisMonth}</div>
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
            <div className="text-2xl font-bold">{userVisits.length}</div>
            <p className="text-xs text-muted-foreground">
              Since your first visit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">
              Logged in today
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
              {userVisits.slice(0, 5).map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{format(new Date(visit.date), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(visit.date), 'p')}</TableCell>
                  <TableCell>{visit.purposes.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
