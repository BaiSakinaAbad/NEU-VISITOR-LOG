"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = (
    <>
      <Link
        href="/admin/dashboard"
        className={cn(
          "text-muted-foreground transition-colors hover:text-foreground",
          pathname === '/admin/dashboard' && "text-foreground font-semibold"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/users"
        className={cn(
          "text-muted-foreground transition-colors hover:text-foreground",
          pathname.startsWith('/admin/users') && "text-foreground font-semibold"
        )}
      >
        User Management
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
        <nav className="hidden flex-col items-center gap-6 text-lg font-medium md:flex md:flex-row md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base mr-4"
          >
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold text-primary">NEU Admin</span>
          </Link>
          {navLinks}
        </nav>
        
        {/* Mobile menu */}
        <div className="md:hidden">
            <Sheet>
            <SheetTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium p-6">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                    <Icons.logo className="h-7 w-7 text-primary" />
                    <span className="font-headline text-xl font-bold text-primary">NEU Admin</span>
                </Link>
                {navLinks}
                </nav>
            </SheetContent>
            </Sheet>
        </div>
        
        <div className="flex w-full items-center justify-end">
          <Header />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
