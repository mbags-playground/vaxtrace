'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, History, Zap, Users, Globe, CheckCircle, ArrowRight, Fingerprint, Database, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4A2D85] to-[#5A3FA0] flex items-center justify-center shadow-lg">
              <Fingerprint className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-xl text-foreground">VaxTrace Africa</span>
          </div>
          <Link href="/auth/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                Secure vaccination records for Africa
              </h1>
              <p className="text-xl text-muted-foreground text-balance">
                Powered by MOSIP biometric identity verification. Accessible offline. Built for everyone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Access VaxTrace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Biometric Secure</span>
                </div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Identity verification</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold text-muted-foreground">Offline Ready</span>
                </div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Works without internet</p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold text-muted-foreground">4 User Roles</span>
                </div>
                <p className="text-2xl font-bold">Multi-Access</p>
                <p className="text-xs text-muted-foreground">Patient to Government</p>
              </CardContent>
            </Card>
            <Card className="border-chart-2/20 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-chart-2" />
                  <span className="text-sm font-semibold text-muted-foreground">Regional</span>
                </div>
                <p className="text-2xl font-bold">Africa-First</p>
                <p className="text-xs text-muted-foreground">Built for africans</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-primary/5 border-y border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Why VaxTrace Africa
            </h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              The solution designed specifically for Africa's healthcare challenges
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Fingerprint className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>MOSIP-Powered Biometrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Fingerprint, iris, and facial recognition ensure authentic identity verification.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Prevents identity fraud</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>No forged records</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Instant verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Bank-Grade Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Role-based access control and encryption protect sensitive vaccination data.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>RBAC enforcement</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>Audit trails</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Complete History Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Immutable vaccine history with MOSIP's verified timestamps and provider details.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Batch number tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Medical history notes</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Verified timestamps</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            What Makes Us Different
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            VaxTrace Africa vs Traditional Solutions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold">Feature</th>
                <th className="text-center py-4 px-4 font-semibold text-primary">VaxTrace</th>
                <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Traditional</th>
                <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Paper-Based</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Offline Functionality', vaxtrace: true, traditional: false, paper: false },
                { feature: 'Biometric Authentication', vaxtrace: true, traditional: false, paper: false },
                { feature: 'Immutable History', vaxtrace: true, traditional: true, paper: false },
                { feature: 'Low Connectivity Support', vaxtrace: true, traditional: false, paper: true },
                { feature: 'Fraud Prevention', vaxtrace: true, traditional: false, paper: false },
                { feature: 'Real-time Sync', vaxtrace: true, traditional: true, paper: false },
                { feature: 'Multi-role Access', vaxtrace: true, traditional: false, paper: false },
                { feature: 'QR Code Sharing', vaxtrace: true, traditional: false, paper: true },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="py-4 px-4 font-medium">{row.feature}</td>
                  <td className="text-center py-4 px-4">
                    {row.vaxtrace ? (
                      <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <div className="w-5 h-5 mx-auto text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.traditional ? (
                      <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <div className="w-5 h-5 mx-auto text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.paper ? (
                      <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <div className="w-5 h-5 mx-auto text-muted-foreground">—</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-primary/5 border-y border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              How VaxTrace Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {[
              {
                step: '1',
                title: 'Biometric Login',
                description: 'Patient or healthcare worker authenticates using fingerprint, iris, or facial recognition via MOSIP',
                icon: Fingerprint,
              },
              {
                step: '2',
                title: 'Record Management',
                description: 'View vaccination history, add new records, or update medical information in real-time or offline',
                icon: Database,
              },
              {
                step: '3',
                title: 'Automatic Sync',
                description: 'When connectivity returns, all offline changes automatically sync to the backend securely',
                icon: Clock,
              },
              {
                step: '4',
                title: 'Share Records',
                description: 'Generate QR codes for secure record verification at borders, clinics, or government checkpoints',
                icon: Globe,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <Card className="border-primary/20 h-full">
                    <CardContent className="pt-6 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary mb-1">Step {item.step}</p>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                  {idx < 3 && (
                    <div className="hidden md:flex absolute -right-3 top-1/3 text-primary">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Built for Everyone
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Four specialized interfaces for different stakeholders
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: 'Patients & Africans',
              description: 'View personal vaccination records, track upcoming doses, share verified records via QR code',
              color: 'border-primary/20 bg-primary/5',
            },
            {
              role: 'Healthcare Workers',
              description: 'Add and verify vaccination records, access patient history, offline record entry and sync',
              color: 'border-accent/20 bg-accent/5',
            },
            {
              role: 'Administrators',
              description: 'Manage users, configure roles, monitor system activity, manage healthcare facilities',
              color: 'border-secondary/20 bg-secondary/5',
            },
            {
              role: 'Government',
              description: 'Access regional analytics, vaccination coverage reports, compliance monitoring dashboards',
              color: 'border-chart-2/20 bg-chart-2/5',
            },
          ].map((item, idx) => (
            <Card key={idx} className={`${item.color} border`}>
              <CardHeader>
                <CardTitle className="text-lg">{item.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* MOSIP Benefits */}
      <section className="bg-primary/5 border-y border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Powered by MOSIP
            </h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Why MOSIP is the trusted choice for identity verification in Africa
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">The MOSIP Advantage</h3>
              <ul className="space-y-4">
                {[
                  'Open-source, auditable identity platform used across Africa',
                  'Biometric data stored securely with multiple encryption layers',
                  'No central point of failure - distributed architecture',
                  'Government-grade compliance and standards',
                  'Already deployed in 15+ African countries',
                  'Zero vendor lock-in - complete data portability',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <div className="space-y-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">15+</p>
                  <p className="text-muted-foreground">African nations using MOSIP</p>
                </div>
                <div className="h-px bg-border"></div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">1B+</p>
                  <p className="text-muted-foreground">Biometric identities worldwide</p>
                </div>
                <div className="h-px bg-border"></div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">99.99%</p>
                  <p className="text-muted-foreground">System uptime SLA</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Ready to secure vaccination records?
              </h2>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                Join healthcare workers, patients, and governments across Africa in building a secure vaccination infrastructure.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Access VaxTrace Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Schedule a Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4A2D85] to-[#5A3FA0] flex items-center justify-center shadow-lg">
                  <Fingerprint className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <span className="font-bold text-foreground">VaxTrace Africa</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure vaccination records for Africa, powered by MOSIP.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 VaxTrace Africa. All rights reserved. Powered by MOSIP.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
