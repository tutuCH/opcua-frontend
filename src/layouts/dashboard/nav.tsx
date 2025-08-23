import React, { useEffect, useMemo } from "react";
import { cn } from "src/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { ScrollArea } from "src/components/ui/scroll-area";

import { usePathname } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";
import { useResponsive } from "src/hooks/use-responsive";

import { NAV } from "./config-layout";
import navConfig from "./config-navigation";
import { BottomNav } from "./bottom-nav";

interface NavProps {
  openNav: boolean;
  onCloseNav: () => void;
}

interface NavItemProps {
  item: {
    title: string;
    path: string;
    icon: React.ReactNode;
  };
}

export default function Nav({ openNav, onCloseNav }: NavProps) {
  const pathname = usePathname();
  const upLg = useResponsive("up", "lg");

  const account = {
    displayName: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    photoURL: "/assets/images/avatars/avatar_25.jpg",
  };

  // Close mobile nav when route changes
  useEffect(() => {
    if (openNav) onCloseNav();
  }, [pathname, openNav, onCloseNav]);

  const content = useMemo(
    () => (
      <ScrollArea className="h-full">
        <div className="flex h-full flex-col">
          <div className="my-3 mx-2.5 py-2 px-2.5 flex items-center rounded-xl bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={account.photoURL} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {account.displayName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium leading-none">
                {account.displayName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {account.email}
              </p>
            </div>
          </div>
          <nav className="px-2 space-y-1">
            {navConfig.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </nav>
          <div className="flex-grow" />
        </div>
      </ScrollArea>
    ),
    [account.displayName, account.email, account.photoURL]
  );

  return (
    <div className="lg:flex-shrink-0" style={{ width: upLg ? NAV.WIDTH : undefined }}>
      {upLg ? (
        <div
          className="h-screen fixed border-r border-dashed border-border"
          style={{ width: NAV.WIDTH }}
        >
          {content}
        </div>
      ) : (
        <BottomNav />
      )}
    </div>
  );
}


const NavItem = React.memo(({ item }: NavItemProps) => {
  const pathname = usePathname();
  const active = pathname.includes(item.path);

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-11 px-3",
        active && "bg-secondary text-secondary-foreground font-semibold"
      )}
      asChild
    >
      <RouterLink href={item.path}>
        <span className="mr-3 flex h-6 w-6 items-center justify-center">
          {item.icon}
        </span>
        <span className="capitalize">{item.title}</span>
      </RouterLink>
    </Button>
  );
});

