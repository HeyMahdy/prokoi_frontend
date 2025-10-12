import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 text-center px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome</h1>
          <p className="text-lg text-muted-foreground">Get started by signing up or logging in to your account</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-base">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
