import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/80">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:40px_40px] [mask-image:radial-gradient(white,transparent_70%)]" />
        </div>

        <div className="relative mx-auto text-center max-w-7xl">
          <Badge variant="outline" className="mb-4">
            🚧 Developer Preview
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-transparent sm:text-6xl bg-clip-text bg-gradient-to-r from-gray-200/90 to-gray-400/90">
            Better Auth for Payload CMS
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-xl text-muted-foreground">
            Revolutionize your Payload CMS authentication with advanced
            features, enhanced security, and a seamless developer experience.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/docs">
              <Button size="lg">
                Get Started
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title> </title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </Link>
            <Link href="https://github.com/b3nab/payload-better-auth">
              <Button variant="outline" size="lg">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title> </title>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Core Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🔐"
              title="Two-Factor Auth"
              description="Enhance security with TOTP-based two-factor authentication for your admin panel."
            />
            <FeatureCard
              icon="⚡️"
              title="Automatic Collections"
              description="Pre-configured collections for seamless auth management and user data."
            />
            <FeatureCard
              icon="🛠"
              title="Extensible Architecture"
              description="Extend collections and auth flows using familiar Payload-like configurations."
            />
            <FeatureCard
              icon="🚀"
              title="Developer Experience"
              description="Comprehensive logging, debugging, and developer-friendly APIs."
            />
            <FeatureCard
              icon="🔒"
              title="Security First"
              description="Rate limiting, encrypted storage, and robust session management built-in."
            />
            <FeatureCard
              icon="📚"
              title="Rich Documentation"
              description="Extensive documentation, examples, and best practices to get you started."
            />
          </div>
        </div>
      </section>

      {/* Code Preview */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-black/5">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Simple Integration
          </h2>
          <div className="p-6 overflow-hidden rounded-lg bg-zinc-900">
            <pre className="text-sm text-gray-300">
              <code>{`import { betterAuthPlugin } from "payload-better-auth";

export default buildConfig({
  plugins: [
    betterAuthPlugin({
      betterAuth: {
        appName: "My App",
        secret: process.env.BETTER_AUTH_SECRET,
      },
      betterAuthPlugins: {
        twoFactor: true,
      },
    }),
  ],
});`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join the community of developers enhancing their Payload CMS
            authentication.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/docs">
              <Button size="lg" variant="default">
                Read the Docs
              </Button>
            </Link>
            <Link href="https://github.com/b3nab/payload-better-auth/issues">
              <Button size="lg" variant="outline">
                Report Issues
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: { icon: string; title: string; description: string }) {
  return (
    <Card className="p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}
