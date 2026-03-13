'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { UserProfile, Visit } from "@/lib/schema";
import { format } from "date-fns";

interface UserActivityDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserActivityDialog({ user, open, onOpenChange }: UserActivityDialogProps) {
  const firestore = useFirestore();

  const visitsRef = useMemoFirebase(
    () => user ? query(collection(firestore, 'users', user.id, 'visits'), orderBy('visitDateTime', 'desc')) : null,
    [firestore, user]
  );
  const { data: visits, isLoading } = useCollection<Visit>(visitsRef);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User Activity: {user.displayName}</DialogTitle>
          <DialogDescription>
            A log of all library visits for {user.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Visit ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Purposes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">Loading activities...</TableCell>
                </TableRow>
              )}
              {!isLoading && (!visits || visits.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">No visits found for this user.</TableCell>
                </TableRow>
              )}
              {visits?.map(visit => (
                <TableRow key={visit.id}>
                  <TableCell className="font-mono text-xs truncate">{visit.id}</TableCell>
                  <TableCell>{format(new Date(visit.visitDateTime), "MMM d, yyyy 'at' p")}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {visit.purposeIds.map(purpose => (
                        <Badge key={purpose} variant="secondary" className="font-normal">{purpose}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
