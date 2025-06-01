"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreVertical, Pencil, Trash, X } from 'lucide-react';
import Link from 'next/link';
import type { Student } from '@/lib/types/dashboard';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
];

const COMMON_ALLERGIES = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree Nuts' },
  { id: 'milk', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'wheat', label: 'Wheat' },
];

export default function StudentsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    admissionNumber: '',
    dietaryPreferences: [] as string[],
    allergies: [] as string[],
    otherAllergies: '',
    additionalNotes: '',
  });

  useEffect(() => {
    if (user && token) {
      fetchStudents();
    }
  }, [user, token]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/parent/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parent/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Student added successfully.",
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        grade: '',
        admissionNumber: '',
        dietaryPreferences: [],
        allergies: [],
        otherAllergies: '',
        additionalNotes: '',
      });
      fetchStudents();

    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch(`/api/parent/students?id=${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Student updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      setFormData({
        name: '',
        grade: '',
        admissionNumber: '',
        dietaryPreferences: [],
        allergies: [],
        otherAllergies: '',
        additionalNotes: '',
      });
      fetchStudents();

    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (studentId: string) => {
    try {
      const res = await fetch(`/api/parent/students?id=${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });

      fetchStudents();

    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      admissionNumber: student.admissionNumber,
      dietaryPreferences: student.dietaryPreferences || [],
      allergies: student.allergies || [],
      otherAllergies: student.otherAllergies || '',
      additionalNotes: student.additionalNotes || '',
    });
    setIsEditDialogOpen(true);
  };

  const togglePreference = (id: string, type: 'dietary' | 'allergies') => {
    const field = type === 'dietary' ? 'dietaryPreferences' : 'allergies';
    const current = formData[field];
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    setFormData({ ...formData, [field]: updated });
  };

  const StudentForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => Promise<void>, submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admissionNumber">Admission Number</Label>
          <Input
            id="admissionNumber"
            value={formData.admissionNumber}
            onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Dietary Preferences</Label>
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dietary-${option.id}`}
                  checked={formData.dietaryPreferences.includes(option.id)}
                  onCheckedChange={() => togglePreference(option.id, 'dietary')}
                />
                <label
                  htmlFor={`dietary-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Allergies</Label>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <div key={allergy.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergy-${allergy.id}`}
                  checked={formData.allergies.includes(allergy.id)}
                  onCheckedChange={() => togglePreference(allergy.id, 'allergies')}
                />
                <label
                  htmlFor={`allergy-${allergy.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {allergy.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherAllergies">Other Allergies</Label>
          <Input
            id="otherAllergies"
            value={formData.otherAllergies}
            onChange={(e) => setFormData({ ...formData, otherAllergies: e.target.value })}
            placeholder="List any other allergies..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Input
            id="additionalNotes"
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            placeholder="Any additional dietary notes or preferences..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

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
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            Manage your students and their information
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the student's details and dietary preferences below
              </DialogDescription>
            </DialogHeader>
            <StudentForm onSubmit={handleSubmit} submitLabel="Add Student" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded-md w-3/4" />
                <div className="h-4 bg-muted rounded-md w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded-md w-full mt-2" />
                <div className="h-4 bg-muted rounded-md w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          students.map((student) => (
            <Card key={student._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <CardDescription>Grade {student.grade}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEdit(student)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400"
                      onClick={() => handleDelete(student._id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Admission Number: {student.admissionNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: ${student.balance.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {student.status}
                    </p>
                  </div>
                  
                  {student.dietaryPreferences && student.dietaryPreferences.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Dietary Preferences</p>
                      <div className="flex flex-wrap gap-1">
                        {student.dietaryPreferences.map((pref) => (
                          <Badge key={pref} variant="secondary">
                            {DIETARY_OPTIONS.find(o => o.id === pref)?.label || pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.allergies && student.allergies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Allergies</p>
                      <div className="flex flex-wrap gap-1">
                        {student.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive">
                            {COMMON_ALLERGIES.find(a => a.id === allergy)?.label || allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {student.otherAllergies && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Other Allergies</p>
                      <p className="text-sm text-muted-foreground">{student.otherAllergies}</p>
                    </div>
                  )}

                  {student.additionalNotes && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Additional Notes</p>
                      <p className="text-sm text-muted-foreground">{student.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's details and dietary preferences below
            </DialogDescription>
          </DialogHeader>
          <StudentForm onSubmit={handleEdit} submitLabel="Update Student" />
        </DialogContent>
      </Dialog>
    </div>
  );
}