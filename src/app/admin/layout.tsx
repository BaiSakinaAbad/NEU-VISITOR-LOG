"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Home, Users } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Header } from '@/components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
            <SidebarHeader className="p-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Icons.logo className="h-7 w-7 text-primary" />
                <span className="font-headline text-xl font-bold text-primary">
                  NEU Admin
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/dashboard'}
                    tooltip="Dashboard"
                  >
                    <Link href="/admin/dashboard">
                      <Home />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin/users')}
                    tooltip="User Management"
                  >
                    <Link href="/admin/users">
                      <Users />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                    {/* Can add search here later */}
                </div>
                <Header/>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
