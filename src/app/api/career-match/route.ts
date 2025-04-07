import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { MatchedCareer } from '@/types/profile'; // Import the new type

// Add a basic GET handler to return Method Not Allowed
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

// Keep the POST handler
export async function POST() {
  const supabase = await createClient();

  // 1. Check user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`Career match request received for user: ${user.id}`);

  try {
    // Debug: Check table structure
    const { data: sampleOccupation, error: structureError } = await supabase
      .from('occupations')
      .select('*')
      .limit(1)
      .single();

    if (structureError) {
      console.error('Error checking table structure:', structureError);
    } else {
      console.log('Table structure:', Object.keys(sampleOccupation));
      
      // Debug: Check if we need to populate RIASEC codes
      const { data: riasecCodes, error: riasecError } = await supabase
        .from('occupations')
        .select('riasec_code')
        .not('riasec_code', 'is', null);

      if (riasecError) {
        console.error('Error checking RIASEC codes:', riasecError);
      } else {
        const uniqueCodes = [...new Set(riasecCodes.map(o => o.riasec_code))];
        console.log('Available RIASEC codes in database:', uniqueCodes);

        // If no RIASEC codes exist, populate them based on interests
        if (uniqueCodes.length === 0) {
          console.log('No RIASEC codes found, populating based on interests...');
          
          // Fetch all occupations with their interests
          const { data: occupations, error: fetchError } = await supabase
            .from('occupations')
            .select('code, interests');

          if (!fetchError && occupations) {
            console.log(`Found ${occupations.length} occupations to update`);

            // Process each occupation
            for (const occ of occupations) {
              if (!occ.interests) continue;

              const interests = occ.interests;

              // Simple mapping of interest keywords to RIASEC codes
              const keywords: Record<keyof typeof counts, string[]> = {
                R: ['mechanical', 'technical', 'hands-on', 'practical', 'physical', 'equipment', 'tools', 'machinery', 'construction', 'repair'],
                I: ['analytical', 'scientific', 'research', 'intellectual', 'investigative', 'analysis', 'data', 'problem-solving', 'mathematics', 'science'],
                A: ['creative', 'artistic', 'expressive', 'design', 'innovative', 'art', 'music', 'writing', 'performance', 'visual'],
                S: ['helping', 'teaching', 'counseling', 'social', 'service', 'people', 'care', 'support', 'community', 'education'],
                E: ['leadership', 'persuading', 'managing', 'entrepreneurial', 'business', 'sales', 'influence', 'negotiation', 'coordination', 'strategy'],
                C: ['organizing', 'detail', 'structured', 'systematic', 'methodical', 'data', 'records', 'procedures', 'accuracy', 'planning']
              };

              // Count matches for each RIASEC type
              const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
              
              // Convert interests object to string and normalize
              const interestsStr = JSON.stringify(interests).toLowerCase();
              console.log(`Processing interests for occupation ${occ.code}:`, interestsStr);

              // Score each RIASEC type based on keyword matches
              for (const [code, words] of Object.entries(keywords) as [keyof typeof counts, string[]][]) {
                for (const word of words) {
                  if (interestsStr.includes(word.toLowerCase())) {
                    counts[code] += 1;
                    console.log(`Found match for ${code}: ${word}`);
                  }
                }
              }

              // Function to find the highest scoring RIASEC code
              const findHighestScoringCode = (scores: typeof counts): keyof typeof counts | null => {
                let maxCount = 0;
                let highestCode: keyof typeof counts | null = null;
                
                for (const [code, count] of Object.entries(scores) as [keyof typeof counts, number][]) {
                  console.log(`Score for ${code}: ${count}`);
                  if (count > maxCount) {
                    maxCount = count;
                    highestCode = code;
                  }
                }
                return highestCode;
              };

              // First try to find a match from interests
              let bestCode = findHighestScoringCode(counts);

              // If no match found, try title and description
              if (!bestCode) {
                console.log(`No keyword matches found for ${occ.code}, trying title/description inference...`);
                const { data: occDetails } = await supabase
                  .from('occupations')
                  .select('title, description')
                  .eq('code', occ.code)
                  .single();

                if (occDetails) {
                  const fullText = (occDetails.title + ' ' + occDetails.description).toLowerCase();
                  // Reset counts for new analysis
                  Object.keys(counts).forEach(key => {
                    counts[key as keyof typeof counts] = 0;
                  });

                  for (const [code, words] of Object.entries(keywords) as [keyof typeof counts, string[]][]) {
                    for (const word of words) {
                      if (fullText.includes(word.toLowerCase())) {
                        counts[code] += 1;
                      }
                    }
                  }

                  bestCode = findHighestScoringCode(counts);
                }
              }

              // Default to 'R' if still no match found
              bestCode = bestCode || 'R';
              console.log(`Final RIASEC code for ${occ.code}: ${bestCode}`);

              // Update the occupation with the determined RIASEC code
              const { error: updateError } = await supabase
                .from('occupations')
                .update({ riasec_code: bestCode })
                .eq('code', occ.code);

              if (updateError) {
                console.error(`Error updating RIASEC code for occupation ${occ.code}:`, updateError);
              }
            }

            console.log('Finished populating RIASEC codes');
          }
        }
      }
    }

    // 2. Fetch user's vocational profile
    const { data: profile, error: profileError } = await supabase
      .from('vocational_profile')
      .select('suggested_onet_codes, assessment_summary') // Select relevant fields
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle as profile might not exist yet

    if (profileError) {
      console.error('Error fetching vocational profile:', profileError);
      throw new Error('Could not fetch user profile.');
    }

    if (!profile) {
      console.log(`No vocational profile found for user: ${user.id}`);
      return NextResponse.json({ matches: [], message: 'Vocational profile not found.' }, { status: 200 });
    }

    let matchedCareers: MatchedCareer[] = []; // Use the imported type

    // Define the fields to select from the occupations table
    const occupationFieldsToSelect = `
      code,
      title,
      description,
      tasks,
      skills,
      knowledge,
      abilities,
      work_context,
      work_values,
      interests,
      work_styles,
      wages,
      outlook,
      riasec_code
    `;

    // 3. Matching Logic
    console.log('Profile data:', profile);
    const suggestedCodes = profile.suggested_onet_codes; // These are ONET codes (e.g., '11-1011.00')

    if (suggestedCodes && Array.isArray(suggestedCodes) && suggestedCodes.length > 0) {
      console.log(`Matching based on suggested ONET codes: ${suggestedCodes.join(', ')}`);
      // Fetch occupations matching suggested codes
      const { data: suggestedOccupations, error: occupationsError } = await supabase
        .from('occupations')
        .select(occupationFieldsToSelect)
        .in('code', suggestedCodes);

      if (occupationsError) {
        console.error('Error fetching suggested occupations:', occupationsError);
        console.error('Failed query details:', {
          table: 'occupations',
          fields: occupationFieldsToSelect,
          codes: suggestedCodes
        });
      } else if (suggestedOccupations) {
        console.log(`Found ${suggestedOccupations.length} occupations matching suggested codes`);
        // Map fetched data to MatchedCareer structure
        matchedCareers = suggestedOccupations.map(occ => ({
          onet_code: occ.code,
          name: occ.title,
          description: occ.description,
          median_wage_annual: occ.wages?.annual_median,
          median_wage_hourly: occ.wages?.hourly_median,
          entry_level_education: occ.work_context?.education_level,
          work_experience: occ.work_context?.experience_required,
          on_the_job_training: occ.work_context?.training_required,
          employment_projection_national_growth_rate: occ.outlook?.growth_rate,
          employment_projection_national_openings: occ.outlook?.annual_openings,
          score: 0.9,
          match_type: 'direct_suggestion'
        }));
        console.log(`Mapped ${matchedCareers.length} careers from suggested occupations`);
      } else {
        console.log('No occupations found matching suggested codes');
      }
    } else {
      console.log('No suggested ONET codes found in profile');
    }

    // Fallback/Secondary Matching if no suggested codes or if we want more results
    if (matchedCareers.length < 10) {
      console.log('Attempting fallback matching based on assessment summary...');
      try {
        const summary = profile.assessment_summary as { holland_codes?: string[] };
        const hollandCodes = summary?.holland_codes;

        if (hollandCodes && Array.isArray(hollandCodes) && hollandCodes.length > 0) {
          const primaryCode = hollandCodes[0];
          console.log(`Using primary Holland code for fallback: ${primaryCode}`);

          // Query occupations where the primary Holland code matches
          const existingCodes = matchedCareers.length > 0
            ? matchedCareers.map(c => c.onet_code)
            : [];

          // Query using the riasec_code column with exact match
          const { data: fallbackOccupations, error: fallbackError } = await supabase
            .from('occupations')
            .select(occupationFieldsToSelect)
            .or(`riasec_code.eq.${primaryCode.toUpperCase()},riasec_code.eq.${primaryCode.toLowerCase()}`)
            .not('code', 'in', existingCodes)
            .limit(10 - matchedCareers.length);

          if (fallbackError) {
            console.error("Error fetching fallback occupations:", fallbackError);
            console.error("Failed query details:", {
              table: 'occupations',
              riasec_code: primaryCode,
              exclude_codes: existingCodes,
              limit: 10 - matchedCareers.length
            });
          } else if (fallbackOccupations) {
            console.log(`Found ${fallbackOccupations.length} fallback occupations for Holland code ${primaryCode}`);
            const fallbackMatches = fallbackOccupations.map(occ => ({
              onet_code: occ.code,
              name: occ.title,
              description: occ.description,
              median_wage_annual: occ.wages?.annual_median,
              median_wage_hourly: occ.wages?.hourly_median,
              entry_level_education: occ.work_context?.education_level,
              work_experience: occ.work_context?.experience_required,
              on_the_job_training: occ.work_context?.training_required,
              employment_projection_national_growth_rate: occ.outlook?.growth_rate,
              employment_projection_national_openings: occ.outlook?.annual_openings,
              score: 0.6,
              match_type: 'holland_match'
            }));
            matchedCareers = [...matchedCareers, ...fallbackMatches];
            console.log(`Total matches after fallback: ${matchedCareers.length}`);
          }
        } else {
          console.log("No Holland codes found in assessment_summary for fallback");
        }
      } catch (parseError) {
        console.error("Error parsing assessment_summary for fallback matching:", parseError);
      }
    }

    // TODO: Implement more sophisticated scoring and ranking
    // TODO: Add pagination if needed

    // 4. Return results
    return NextResponse.json({ matches: matchedCareers });

  } catch (error) {
    console.error('Career Match API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
