import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Helper component to display JSONB data nicely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JsonDisplay: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  if (data === null || data === undefined) {
    return null; // Don't render section if data is null/undefined
  }
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto border dark:border-gray-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default async function VocationalProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?message=Please log in to view your vocational profile.');
  }

  // Fetch the vocational profile data
  const { data: profileData, error: profileError } = await supabase
    .from('vocational_profile')
    .select('*') // Select all columns
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching vocational profile:", profileError);
    // You might want to show an error message component here
    return <div className="container mx-auto p-4 text-red-500">Error loading profile data.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Vocational Profile</h1>

      {profileData ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Raw data stored for your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">User ID</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.user_id}</p>
              </div>

              <JsonDisplay title="Assessment Summary" data={profileData.assessment_summary} />
              <JsonDisplay title="Dreamscapes Analysis" data={profileData.dreamscapes_analysis} />
              <JsonDisplay title="Quiz Performance" data={profileData.quiz_performance} />

              <div>
                <h3 className="text-lg font-semibold mb-1">Combined Profile Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {profileData.combined_profile_summary || 'Not generated yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Suggested O*NET Codes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profileData.suggested_onet_codes && profileData.suggested_onet_codes.length > 0
                    ? profileData.suggested_onet_codes.join(', ')
                    : 'None suggested yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Last Updated</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(profileData.last_updated).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-gray-600 mt-10">
          No vocational profile data found for your account. Please complete the assessments.
        </p>
      )}
    </div>
  );
}
