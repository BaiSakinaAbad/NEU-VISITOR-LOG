"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Icons } from "./icons";
import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/schema";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const adminRoleRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRole } = useDoc(adminRoleRef);
  
  const isAdmin = adminRole !== null;

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  }
  
  const userName = userProfile?.displayName ?? "";
  const userEmail = userProfile?.email ?? "";
  const userAvatar = user?.photoURL;
  const userFallback = (userProfile?.displayName?.split(' ').map(n => n[0]).join('')) ?? "U";
  const profileLink = isAdmin ? '/admin/dashboard' : '/dashboard';

  const title = pathname.startsWith('/admin') ? "NEU Admin" : "NEU Library";
  const titleLink = pathname.startsWith('/admin') ? "/admin/dashboard" : "/dashboard";

  const UserMenu = (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 h-auto">
              <Avatar className="h-8 w-8">
                {isAdmin && !userAvatar ? (
                   <AvatarFallback>
                     <User className="h-5 w-5" />
                   </AvatarFallback>
                ) : (
                  <>
                    {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                    <AvatarFallback>{userFallback}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{isProfileLoading ? "Loading..." : userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {isProfileLoading ? "" : userEmail}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileLink)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  if (pathname.startsWith('/admin')) {
      return UserMenu;
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center space-x-4 px-4 md:px-8 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Link href={titleLink} className="flex items-center gap-2">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold text-primary">
              {title}
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user && UserMenu}
        </div>
      </div>
    </header>
  );
}
