'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Stethoscope, BarChart3, PieChart } from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface RoleOption {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'patient',
    name: 'Patient',
    description: 'View and manage your vaccination records securely',
    icon: <User className="h-8 w-8" />,
    color: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'healthcare_worker',
    name: 'Healthcare Worker',
    description: 'Register and verify vaccinations at clinics and borders',
    icon: <Stethoscope className="h-8 w-8" />,
    color: 'bg-green-50 hover:bg-green-100',
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage system users and configurations',
    icon: <BarChart3 className="h-8 w-8" />,
    color: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    id: 'government',
    name: 'Government Official',
    description: 'View aggregated vaccination statistics and reporting',
    icon: <PieChart className="h-8 w-8" />,
    color: 'bg-amber-50 hover:bg-amber-100',
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Store selected role in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user_role', role);
      }

      // Redirect to role-specific dashboard
      router.push(`/${role}/dashboard`);
    } catch (error) {
      console.error('[v0] Error selecting role:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to VaxTrace Africa</h1>
          <p className="text-muted-foreground text-lg">
            Select your role to access the appropriate dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roleOptions.map((role) => (
            <Button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              disabled={isLoading}
              variant="outline"
              className="h-auto p-6 hover:border-primary transition-colors"
            >
              <Card className={`w-full ${role.color}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="text-primary">{role.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{role.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 border border-border">
          <h2 className="font-semibold mb-4 text-foreground">How it works</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-primary">1.</span>
              <span>Verify your identity using MOSIP biometric authentication</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">2.</span>
              <span>Select your role to access role-specific features</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">3.</span>
              <span>Access all features offline - data syncs when connected</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">4.</span>
              <span>Your vaccination records are secure and encrypted</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
