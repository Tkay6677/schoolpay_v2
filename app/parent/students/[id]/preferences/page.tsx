"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface StudentPreferences {
  dietary: string[];
  allergies: string[];
  otherAllergies?: string;
  additionalNotes?: string;
}

export default function StudentPreferencesPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [newDietary, setNewDietary] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentRes = await fetch(`/api/students/${id}`);
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Fetch preferences
        const prefsRes = await fetch(`/api/lunch-preferences?studentId=${id}`);
        const prefsData = await prefsRes.json();
        setPreferences(prefsData || { dietary: [], allergies: [] });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load student preferences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, toast]);

  const handleAddDietary = () => {
    if (newDietary.trim()) {
      setPreferences((prev: StudentPreferences) => ({
        ...prev,
        dietary: [...prev.dietary, newDietary.trim()]
      }));
      setNewDietary('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setPreferences((prev: StudentPreferences) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveDietary = (item: string) => {
    setPreferences((prev: StudentPreferences) => ({
      ...prev,
      dietary: prev.dietary.filter(i => i !== item)
    }));
  };

  const handleRemoveAllergy = (item: string) => {
    setPreferences((prev: StudentPreferences) => ({
      ...prev,
      allergies: prev.allergies.filter(i => i !== item)
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/lunch-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: id,
          ...preferences
        }),
      });

      if (!res.ok) throw new Error('Failed to save preferences');

      toast({
        title: "Success",
        description: "Lunch preferences saved successfully",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center mb-6">
        <Link href={`/parent/students/${id}`}>
          <Button variant="outline" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Lunch Preferences</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-md" />
              <div className="h-24 bg-muted animate-pulse rounded-md" />
              <div className="h-24 bg-muted animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Requirements</CardTitle>
              <CardDescription>
                Add any dietary requirements or preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.dietary.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {item}
                    <button
                      onClick={() => handleRemoveDietary(item)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add dietary requirement"
                  value={newDietary}
                  onChange={(e) => setNewDietary(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDietary()}
                />
                <Button onClick={handleAddDietary} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>
                Add any food allergies or intolerances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {preferences.allergies.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {item}
                    <button
                      onClick={() => handleRemoveAllergy(item)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add allergy"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                />
                <Button onClick={handleAddAllergy} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  );
}