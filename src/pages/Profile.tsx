import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (error) {
        toast.error('Failed to update profile: ' + error.message);
        return;
      }
      
      toast.success('Profile updated successfully');
      refreshProfile();
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Full Name</label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <CardFooter>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
