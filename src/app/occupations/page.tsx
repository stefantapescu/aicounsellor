import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const metadata = {
  title: 'Occupations - AI Youni',
  description: 'Browse career occupations from the Bureau of Labor Statistics O*NET database',
};

export default async function OccupationsPage() {
  const supabase = await createClient();
  
  // Fetch occupations from the database
  const { data: occupations, error } = await supabase
    .from('occupations')
    .select('*')
    .order('title')
    .limit(50);

  if (error) {
    console.error('Error fetching occupations:', error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Occupations Database</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading occupations. Please try again later.</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Occupations Database</h1>
      <p className="mb-6 text-gray-600">
        Explore career occupations imported from the Bureau of Labor Statistics O*NET database.
        These occupations can be used for career exploration and simulation generation.
      </p>
      
      {occupations && occupations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {occupations.map((occupation) => (
            <div 
              key={occupation.code} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold">{occupation.title}</h2>
              <p className="text-sm text-gray-500 mb-2">Code: {occupation.code}</p>
              
              <div className="mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {occupation.category || 'Uncategorized'}
                </span>
                {occupation.education_level && (
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-2">
                    {occupation.education_level}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                {occupation.description}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">Salary:</span> 
                  {occupation.median_salary ? 
                    `$${occupation.median_salary.toLocaleString()}` : 
                    'Not available'}
                </div>
                <div>
                  <span className="font-medium">Growth:</span> 
                  {typeof occupation.growth_rate === 'number' ? 
                    `${(occupation.growth_rate * 100).toFixed(1)}%` : 
                    'Not available'}
                </div>
              </div>
              
              {occupation.skills && typeof occupation.skills === 'object' && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-1">Top Skills:</h3>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(occupation.skills)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 3)
                      .map(([skill, level]) => (
                        <span key={skill} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {skill.replace(/_/g, ' ')}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Link 
                  href={`/career-explorer?search=${encodeURIComponent(occupation.title)}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Explore this career →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No occupations found. Please import occupations using the API endpoint first.</p>
        </div>
      )}
    </div>
  );
} 