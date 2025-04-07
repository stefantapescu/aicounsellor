'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MatchedCareer } from '@/types/profile'; // Import the shared type
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'; // Assuming formatters exist

interface CareerListClientComponentProps {
  careers: MatchedCareer[]; // Use the imported type
}

const CareerListClientComponent: React.FC<CareerListClientComponentProps> = ({ careers }) => {

  const getMatchTypeBadgeVariant = (matchType?: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (matchType) {
      case 'direct_suggestion':
        return 'default'; // Primary badge style
      case 'holland_match':
        return 'secondary'; // Secondary badge style
      default:
        return 'outline'; // Default outline style
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {careers.map((career) => (
        <Link key={career.onet_code} href={`/career-explorer/${career.onet_code}`} passHref legacyBehavior>
          <a className="block hover:shadow-lg transition-shadow duration-200 h-full"> {/* Make link cover card and add hover effect */}
            <Card className="h-full flex flex-col"> {/* Ensure card takes full height of link */}
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-semibold">{career.name}</CardTitle>
                  {career.score && (
                    <Badge variant="outline" className="whitespace-nowrap">
                      Score: {(career.score * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {career.match_type && (
                   <Badge variant={getMatchTypeBadgeVariant(career.match_type)} className="mt-1 w-fit">
                     {career.match_type.replace('_', ' ')}
                   </Badge>
                 )}
              </CardHeader>
              <CardContent className="flex-grow"> {/* Allow content to grow */}
                <CardDescription className="mb-4">
                  {/* Truncate long descriptions */}
                  {career.description ? `${career.description.substring(0, 120)}${career.description.length > 120 ? '...' : ''}` : 'No description available.'}
                </CardDescription>

                {/* Display Salary and Outlook */}
                <div className="text-sm text-gray-600 space-y-1">
                  {career.median_wage_annual != null && (
                    <p>
                      <span className="font-medium">Median Salary:</span> {formatCurrency(career.median_wage_annual)}/year
                    </p>
                  )}
                  {career.employment_projection_national_growth_rate != null && (
                     <p>
                       <span className="font-medium">Job Growth:</span> {formatPercent(career.employment_projection_national_growth_rate)}
                       <span className="text-xs"> (Projected {new Date().getFullYear()}-{new Date().getFullYear() + 10})</span>
                     </p>
                   )}
                   {career.employment_projection_national_openings != null && (
                     <p>
                       <span className="font-medium">Annual Openings:</span> {formatNumber(career.employment_projection_national_openings)}
                     </p>
                   )}
                </div>
              </CardContent>
              {/* Optional Footer for quick actions */}
              {/* <CardFooter className="pt-4 border-t">
                <p>View Details</p>
              </CardFooter> */}
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default CareerListClientComponent;
