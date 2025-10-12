"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RequestsNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  const navItems = [
    { href: "/requests/send", label: "Send Request" },
    { href: "/requests/incoming", label: "Incoming" },
    { href: "/requests/outgoing", label: "Outgoing" },
  ]

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-foreground">Organization Requests</h1>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      pathname === item.href && "bg-accent text-foreground",
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              Organizations
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
