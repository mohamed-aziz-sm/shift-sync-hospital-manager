import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import type { Doctor, DoctorGroup } from '@/types';
import { doctorsApi } from '@/services/api';

interface FormData {
  name: string;
  email: string;
  specialty: string;
  group_id: DoctorGroup;
}

const Doctors = () => {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<Array<Doctor & { shiftCount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    specialty: '',
    group_id: 1 as DoctorGroup,
  });
  const isAdmin = profile?.role === 'admin';

  // Fetch doctors and their shift counts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select(`
            *,
            shifts:shifts(count)
          `);

        if (doctorsError) throw doctorsError;

        const doctorsWithCounts = doctorsData.map(doctor => ({
          ...doctor,
          shiftCount: doctor.shifts?.[0]?.count || 0
        }));

        setDoctors(doctorsWithCounts);
      } catch (error: any) {
        toast.error('Failed to load doctors: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, group_id: Number(value) as DoctorGroup }));
  };

  const handleAddDoctor = async () => {
    try {
      const newDoctor = await doctorsApi.create({
        name: formData.name,
        email: formData.email,
        specialty: formData.specialty,
        group_id: formData.group_id,
        user_id: '00000000-0000-0000-0000-000000000000' // placeholder, would be real user_id in production
      });

      setDoctors(prev => [...prev, newDoctor]);
      setIsAddDialogOpen(false);
      toast.success('Doctor added successfully');
      resetForm();
    } catch (error: any) {
      toast.error('Failed to add doctor: ' + error.message);
    }
  };
  
  const handleEditClick = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      group_id: doctor.group_id,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditDoctor = async () => {
    if (!currentDoctor) return;
    
    try {
      const updatedDoctor = await doctorsApi.update(currentDoctor.id, {
        name: formData.name,
        email: formData.email,
        specialty: formData.specialty,
        group_id: formData.group_id,
      });

      setDoctors(prev => 
        prev.map(doc => doc.id === currentDoctor.id ? updatedDoctor : doc)
      );
      
      setIsEditDialogOpen(false);
      toast.success('Doctor updated successfully');
      resetForm();
    } catch (error: any) {
      toast.error('Failed to update doctor: ' + error.message);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await doctorsApi.delete(id);
      setDoctors(prev => prev.filter(doc => doc.id !== id));
      toast.success('Doctor removed successfully');
    } catch (error: any) {
      toast.error('Failed to delete doctor: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      specialty: '',
      group_id: 1 as DoctorGroup,
    });
    setCurrentDoctor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground mt-1">
            View hospital doctors and their assignments
          </p>
        </div>

        {(
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    placeholder="Enter medical specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Select 
                    value={formData.group_id.toString()}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((group) => (
                          <SelectItem key={group} value={group.toString()}>
                            Group {group}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDoctor}>Save Doctor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Assigned Shifts</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 6} className="text-center py-8 text-muted-foreground">
                    {isLoading ? 'Loading doctors...' : 'No doctors found.'}
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>Group {doctor.group_id}</TableCell>
                    <TableCell>{doctor.shiftCount}</TableCell>
                    { (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialty">Specialty</Label>
              <Input
                id="edit-specialty"
                name="specialty"
                placeholder="Enter medical specialty"
                value={formData.specialty}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group">Group</Label>
              <Select 
                value={formData.group_id.toString()}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((group) => (
                      <SelectItem key={group} value={group.toString()}>
                        Group {group}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDoctor}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Doctors;
