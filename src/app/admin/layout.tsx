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
                  <Link href="/admin/dashboard" passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/admin/dashboard'}
                      tooltip="Dashboard"
                    >
                      <a>
                        <Home />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/dashboard" passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith('/admin/users')}
                      tooltip="User Management"
                    >
                      <a>
                        <Users />
                        <span>User Management</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
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
