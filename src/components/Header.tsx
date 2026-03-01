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
import { LogOut, User } from "lucide-react";
import { Icons } from "./icons";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const userName = isAdmin ? "Jeremias C. Esperanza" : "Alex Johnson";
  const userEmail = isAdmin ? "admin@neu.edu.ph" : "alex.j@neu.edu";
  const userAvatar = isAdmin ? "https://i.pravatar.cc/150?u=jeremias" : "https://i.pravatar.cc/150?u=a042581f4e29026024d";
  const userFallback = isAdmin ? "JE" : "AJ";
  const profileLink = isAdmin ? '/admin/dashboard' : '/dashboard';

  const title = isAdmin ? "NEU Admin" : "NEU Library";
  const titleLink = isAdmin ? "/admin/dashboard" : "/dashboard";

  const UserMenu = (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              {isAdmin ? (
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>{userFallback}</AvatarFallback>
                </>
              )}
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileLink)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/login')}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isAdmin) {
      return UserMenu;
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Link href={titleLink} className="flex items-center gap-2">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold text-primary">
              {title}
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {UserMenu}
        </div>
      </div>
    </header>
  );
}
