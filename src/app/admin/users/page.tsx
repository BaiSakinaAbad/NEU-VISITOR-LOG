"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  } from "@/components/ui/alert-dialog"
  
import { MoreHorizontal, Search, UserX, Activity } from "lucide-react";
import type { UserProfile } from "@/lib/schema";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, query, updateDoc, getDocs, orderBy, limit, startAfter, type DocumentSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UserActivityDialog } from "@/components/UserActivityDialog";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: authUser } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [activityUser, setActivityUser] = useState<UserProfile | null>(null);
  const [blockUser, setBlockUser] = useState<UserProfile | null>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadUsers = useCallback(async (loadMore = false) => {
      if (!firestore) return;
      if (loadMore && !hasMore) return;

      setIsLoading(true);

      try {
          let q;
          if (loadMore && lastVisible) {
              q = query(collection(firestore, 'users'), orderBy('displayName'), startAfter(lastVisible), limit(PAGE_SIZE));
          } else {
              q = query(collection(firestore, 'users'), orderBy('displayName'), limit(PAGE_SIZE));
          }

          const docSnaps = await getDocs(q);
          const newUsers = docSnaps.docs.map(doc => ({ ...doc.data(), id: doc.id })) as UserProfile[];

          setHasMore(newUsers.length === PAGE_SIZE);
          setLastVisible(docSnaps.docs[docSnaps.docs.length - 1] || null);
          
          if (loadMore) {
              setUsers(prev => [...prev, ...newUsers]);
          } else {
              setUsers(newUsers);
          }

      } catch (error) {
          console.error("Failed to fetch users:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not fetch users." });
      } finally {
          setIsLoading(false);
      }
  }, [firestore, lastVisible, hasMore, toast]);
  
  useEffect(() => {
    if (firestore) {
      loadUsers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const handleLoadMore = () => {
    loadUsers(true);
  };

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    const newStatus = !currentStatus;

    try {
        await updateDoc(userRef, { isBlocked: newStatus });
        // Update local state for immediate UI feedback
        setUsers(currentUsers => currentUsers.map(u => 
            u.id === userId ? { ...u, isBlocked: newStatus } : u
        ));
        toast({
            title: "Success",
            description: `User has been ${newStatus ? 'blocked' : 'unblocked'}.`,
        });
    } catch (error) {
        console.error("Failed to update user status:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update user status. Please check permissions and try again.",
        });
    }
  };

  const filteredUsers = users.filter(user => 
    (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
                      placeholder="Search loaded users by name or email..." 
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
                  {isLoading && users.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => setActivityUser(user)}>
                                      <Activity className="mr-2 h-4 w-4" />
                                      View Activity
                                  </DropdownMenuItem>
                                  {authUser?.uid !== user.id && (
                                      <DropdownMenuItem onSelect={() => setBlockUser(user)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                          <UserX className="mr-2 h-4 w-4" />
                                          {user.isBlocked ? "Unblock" : "Block"} User
                                      </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              </Table>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          {hasMore && (
            <Button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          )}
          {!hasMore && users.length > 0 && <p className="text-sm text-muted-foreground">End of list.</p>}
          {!hasMore && users.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No users found.</p>}
        </CardFooter>
      </Card>
      
      {activityUser && (
        <UserActivityDialog 
          user={activityUser} 
          open={!!activityUser} 
          onOpenChange={(isOpen) => { if (!isOpen) setActivityUser(null); }} 
        />
      )}

      {blockUser && (
        <AlertDialog open={!!blockUser} onOpenChange={(isOpen) => { if (!isOpen) setBlockUser(null); }}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action will {blockUser.isBlocked ? "unblock" : "block"} {blockUser.displayName || 'this user'} and {blockUser.isBlocked ? "allow" : "prevent"} them from accessing the library system.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleBlockUser(blockUser.id, blockUser.isBlocked);
                  setBlockUser(null);
                }} 
                className={blockUser.isBlocked ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
              >
                  Confirm
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
