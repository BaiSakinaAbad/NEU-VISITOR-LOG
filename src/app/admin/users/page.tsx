"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  
import { MoreHorizontal, Search, UserX } from "lucide-react";
import type { UserProfile } from "@/lib/schema";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, query } from "firebase/firestore";

export default function UsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const [searchQuery, setSearchQuery] = useState("");

  const handleBlockUser = (userId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userRef, { isBlocked: !currentStatus });
  };

  const filteredUsers = users?.filter(user => 
    (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Search, view, and manage library users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search users by name or email..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <div className="overflow-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {usersLoading && <TableRow><TableCell colSpan={3} className="text-center">Loading users...</TableCell></TableRow>}
                {!usersLoading && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                            <AvatarFallback>{(user.displayName || 'U').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={user.isBlocked ? "destructive" : "secondary"}>
                            {user.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        <UserX className="mr-2 h-4 w-4" />
                                        {user.isBlocked ? "Unblock" : "Block"} User
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will {user.isBlocked ? "unblock" : "block"} {user.displayName || 'this user'} and {user.isBlocked ? "allow" : "prevent"} them from accessing the library system.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBlockUser(user.id, user.isBlocked)} className={user.isBlocked ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}>
                                Confirm
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
