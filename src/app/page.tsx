import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Code2,
  Users,
  Trophy,
  Rocket,
  CheckCircle2,
  Laptop,
  BrainCircuit,
  Target,
  Zap,
  GraduationCap,
  Layout
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Header / Nav */}
      <header className="px-6 py-4 flex items-center justify-between fixed top-0 w-full z-50 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="relative h-8 w-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Impact360 OS Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-heading uppercase tracking-wide">Impact360 OS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {['Features', 'Tracks', 'Community'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-foreground transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-4 py-1.5 rounded-full text-sm backdrop-blur-md">
                ✨ Transforming Tech Careers
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] font-heading uppercase">
                Build <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#4A7EEC]">Real-World</span> Tech Experience
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed font-sans">
                Stop doing tutorials. Start shipping code. Impact360 OS connects you with real projects, expert mentors, and a gamified career roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                <Link href="/sign-up">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 border-0 shadow-lg hover:shadow-primary/20 transition-all transform hover:scale-105">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary/20 bg-primary/5 hover:bg-primary/10 text-foreground backdrop-blur-sm">
                    Explore Features
                  </Button>
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="pt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-foreground overflow-hidden shadow-sm">
                      <div className="h-full w-full bg-linear-to-br from-white/20 to-transparent" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-foreground">500+ Members</div>
                  <div className="text-xs">Joined this month</div>
                </div>
              </div>
            </div>

            {/* Hero Graphic / Glass Card Stack */}
            <div className="flex-1 relative w-full h-[500px] hidden md:block perspective-[2000px]">
              {/* Card 1 (Back) */}
              <div className="absolute top-0 right-10 w-[300px] h-[400px] rounded-3xl bg-card/50 border border-border backdrop-blur-md -rotate-6 translate-y-8 opacity-60 transform transition-transform hover:-rotate-8 shadow-2xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-muted-foreground">Activity</div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Layout className="h-4 w-4 text-primary" /></div>
                  </div>
                  <div className="h-32 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 mb-4" />
                  <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-muted rounded-full" />
                    <div className="h-2 w-1/2 bg-muted rounded-full" />
                  </div>
                </div>
              </div>

              {/* Card 2 (Middle) */}
              <div className="absolute top-10 right-[15%] w-[320px] h-[450px] rounded-3xl bg-card border border-border backdrop-blur-xl -rotate-3 translate-y-4 opacity-80 transform transition-transform hover:-rotate-5 hover:translate-y-2 shadow-xl z-10">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Project Completed</div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-muted/50 p-4 border border-border mb-4 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Performance</span>
                      <span className="text-green-500 font-bold">+24%</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-green-500 rounded-full" />
                    </div>
                  </div>
                  <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 font-medium shadow-none">View Details</Button>
                </div>
              </div>

              {/* Card 3 (Front - Main) */}
              <div className="absolute top-[80px] right-[30%] w-[340px] h-[480px] rounded-[32px] bg-card border border-border backdrop-blur-2xl shadow-2xl z-20 flex flex-col transform transition-transform hover:-translate-y-2 group">
                <div className="p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wider text-primary uppercase mb-1">Current Level</h3>
                      <div className="text-4xl font-bold font-heading">Lvl 5</div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-shadow">
                      <Rocket className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Progress Circle Visual */}
                  <div className="flex-1 flex items-center justify-center relative my-4">
                    <div className="w-48 h-48 rounded-full border-12 border-muted flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-12 border-primary border-t-transparent rotate-45" />
                      <div className="text-center">
                        <div className="text-3xl font-bold">85%</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">XP Gained</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                    <div className="flex justify-between text-sm text-foreground/80">
                      <span>Next Rank</span>
                      <span className="text-primary">Rising Star</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section with Glass Cards */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { number: "500+", label: "Active Members", icon: Users },
                { number: "120+", label: "Projects Shipped", icon: Layout },
                { number: "50+", label: "Expert Mentors", icon: Zap },
                { number: "95%", label: "Placement Rate", icon: Target },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-card border border-border backdrop-blur-md flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors group shadow-lg">
                  <div className="mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1 font-heading">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-secondary">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold font-heading uppercase">Why Impact360?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sans">
                Features designed to accelerate your growth from day one.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Laptop,
                  title: "Real Projects",
                  desc: "Work on live applications with real stakeholders. Build a portfolio that actually matters to employers.",
                  gradient: "from-blue-500 to-cyan-400"
                },
                {
                  icon: Users,
                  title: "Expert Mentorship",
                  desc: "Weekly code reviews and 1:1 sessions with senior engineers from top tech companies.",
                  gradient: "from-purple-500 to-indigo-400"
                },
                {
                  icon: Trophy,
                  title: "Gamified Progress",
                  desc: "Level up your skills, earn badges, and track your journey on the global leaderboard.",
                  gradient: "from-orange-500 to-amber-400"
                }
              ].map((item, i) => (
                <div key={i} className="group relative p-1 rounded-3xl bg-linear-to-b from-primary/20 to-transparent hover:from-primary/40 transition-all duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-b from-primary/10 to-transparent blur-md -z-10" />
                  <div className="h-full bg-card rounded-[22px] p-8 border border-border relative overflow-hidden shadow-xl">
                    {/* Hover Gradient Bloom */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-linear-to-br from-primary to-[#4A7EEC] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />

                    <div className={`h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg transform group-hover:-translate-y-1 transition-transform`}>
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 font-heading">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tracks Section */}
        <section id="tracks" className="py-24 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div>
                <h2 className="text-4xl font-bold mb-4 font-heading uppercase">Choose Your Path</h2>
                <p className="text-xl text-muted-foreground font-sans">Curated learning tracks for modern tech roles.</p>
              </div>
              <Link href="/sign-up">
                <Button variant="outline" className="border-border text-foreground hover:bg-muted">View All Tracks</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Web Development", icon: Code2, tags: ["React", "Next.js", "Node.js"], color: "text-blue-400", bg: "bg-blue-500/10" },
                { title: "AI & Machine Learning", icon: BrainCircuit, tags: ["Python", "TensorFlow", "PyTorch"], color: "text-purple-400", bg: "bg-purple-500/10" },
                { title: "Mobile Engineering", icon: Target, tags: ["React Native", "Flutter", "iOS"], color: "text-green-400", bg: "bg-green-500/10" },
              ].map((track, i) => (
                <Link key={i} href="/sign-up" className="block group">
                  <div className="h-full p-6 rounded-3xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all backdrop-blur-sm shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary`}>
                        <track.icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-heading uppercase">{track.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {track.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden bg-background">
          {/* Background glow for CTA */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-3xl h-full bg-primary/10 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight font-heading uppercase">
              Ready to launch your career?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sans">
              Join hundreds of developers building the future. Review code, ship products, and get hired.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/sign-up">
                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl transition-all hover:scale-105">
                  Get Started Now
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">No credit card required • Free for students</p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border bg-background text-muted-foreground font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2 font-bold text-xl text-foreground">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.png"
                  alt="Impact360 OS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading uppercase">Impact360 OS</span>
            </div>
            <p className="text-sm">
              Empowering the next generation of tech leaders through structured learning and practical experience.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground font-heading uppercase">Platform</h4>
              <Link href="#" className="block hover:text-primary transition-colors">Features</Link>
              <Link href="#" className="block hover:text-primary transition-colors">Pricing</Link>
              <Link href="#" className="block hover:text-primary transition-colors">About</Link>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground font-heading uppercase">Resources</h4>
              <Link href="#" className="block hover:text-primary transition-colors">Blog</Link>
              <Link href="#" className="block hover:text-primary transition-colors">Documentation</Link>
              <Link href="#" className="block hover:text-primary transition-colors">Community</Link>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground font-heading uppercase">Legal</h4>
              <Link href="#" className="block hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="block hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm">
          © {new Date().getFullYear()} Impact360 OS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}