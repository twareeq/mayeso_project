import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, FileText, Users, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Mayeso</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/login" 
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Mayeso Platform is Now Live
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Modern Education <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Performance Monitoring
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              A comprehensive platform designed to streamline school management, track student performance, and automate grading pipelines with precision.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/25"
              >
                Access Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-3.5 rounded-full font-medium text-lg hover:bg-secondary/80 transition-all border"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your school</h2>
              <p className="text-lg text-muted-foreground">
                Purpose-built tools for administrators, head teachers, and teaching staff to collaborate effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive dashboards providing immediate insights into student performance and school metrics.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Automated Grading</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built-in 30/70 continuous assessment and exam grading pipeline conforming to curriculum standards.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Reports</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate beautiful, print-ready PDF report cards for students and classes with a single click.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Secure workspaces tailored for system administrators, head teachers, and class teachers.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Class Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Easily organize terms, subjects, teacher assignments, and student enrollments.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
                <div className="h-12 w-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Records</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Maintain comprehensive academic histories and track progress across multiple terms seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your school?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join the Mayeso platform today and streamline your educational management workflow.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold text-lg">Mayeso</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Mayeso Education Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
