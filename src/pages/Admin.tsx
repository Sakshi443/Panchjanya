import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Temple = Tables<'temples'>;
type Submission = Tables<'temple_submissions'>;

export default function Admin() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templesResult, submissionsResult] = await Promise.all([
        supabase.from('temples').select('*').order('created_at', { ascending: false }),
        supabase.from('temple_submissions').select('*').order('created_at', { ascending: false })
      ]);

      if (templesResult.error) throw templesResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setTemples(templesResult.data || []);
      setSubmissions(submissionsResult.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('temple_submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Submission approved successfully',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('temple_submissions')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Submission rejected',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (templeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('temples')
        .update({ is_published: !currentStatus })
        .eq('id', templeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Temple ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <Button onClick={signOut} variant="outline">Logout</Button>
      </div>

      <Tabs defaultValue="temples" className="w-full">
        <TabsList>
          <TabsTrigger value="temples">Temples ({temples.length})</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({submissions.filter(s => s.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temples" className="space-y-4">
          {temples.map((temple) => (
            <Card key={temple.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{temple.name}</CardTitle>
                    <CardDescription>{temple.location}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={temple.is_published ? 'default' : 'secondary'}>
                      {temple.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => togglePublish(temple.id, temple.is_published || false)}
                    >
                      {temple.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  District: {temple.district} | Taluka: {temple.taluka}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.filter(s => s.status === 'pending').map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.submission_type}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(submission.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge>{submission.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="text-sm bg-muted p-3 rounded">
                    {JSON.stringify(submission.data, null, 2)}
                  </pre>
                  {submission.notes && (
                    <p className="text-sm text-muted-foreground">Notes: {submission.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => approveSubmission(submission.id)}>
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectSubmission(submission.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {submissions.filter(s => s.status === 'pending').length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending submissions
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
