import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import StreamZip from 'node-stream-zip';
import { Database } from '../types/supabase';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const ONET_DB_URL = 'https://www.onetcenter.org/dl_files/database/db_29_0_text.zip';
const DATA_DIR = path.join(process.cwd(), 'data', 'onet');

async function downloadFile(url: string, targetPath: string): Promise<void> {
  console.log(`Downloading ${url} to ${targetPath}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(targetPath);
  await new Promise<void>((resolve, reject) => {
    if (!response.body) {
      reject(new Error('No response body'));
      return;
    }

    const reader = response.body.getReader();
    const writer = fileStream;

    async function pump(): Promise<void> {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            writer.end();
            console.log('Download complete!');
            resolve();
            break;
          }
          writer.write(value);
        }
      } catch (error) {
        writer.end();
        reject(error);
      }
    }

    pump();
  });
}

async function extractZip(zipPath: string, targetPath: string): Promise<void> {
  console.log(`Extracting ${zipPath} to ${targetPath}...`);
  const zip = new StreamZip.async({
    file: zipPath,
    storeEntries: true,
  });

  try {
    await zip.extract(null, targetPath);
    console.log('Extraction complete!');
  } finally {
    await zip.close();
  }
}

async function processCSVFile(filePath: string): Promise<any[]> {
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      delimiter: '\t',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      quote: false,        // Disable quote parsing
      escape: false,       // Disable escape characters
      relaxQuotes: true,   // Allow quotes in unquoted fields
    }, (err: Error | undefined, data: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function processOnetData() {
  try {
    // Create data directory if it doesn't exist
    await fs.promises.mkdir(DATA_DIR, { recursive: true });

    // Download the database files
    const dbZipPath = path.join(DATA_DIR, 'onet_db.zip');
    await downloadFile(ONET_DB_URL, dbZipPath);

    // Extract the ZIP file
    await extractZip(dbZipPath, DATA_DIR);

    // Process the extracted files
    const extractedDir = path.join(DATA_DIR, 'db_29_0_text');
    const occupationsData = await processCSVFile(path.join(extractedDir, 'Occupation Data.txt'));
    const tasksData = await processCSVFile(path.join(extractedDir, 'Task Statements.txt'));
    const skillsData = await processCSVFile(path.join(extractedDir, 'Skills.txt'));
    const knowledgeData = await processCSVFile(path.join(extractedDir, 'Knowledge.txt'));
    const abilitiesData = await processCSVFile(path.join(extractedDir, 'Abilities.txt'));
    const workContextData = await processCSVFile(path.join(extractedDir, 'Work Context.txt'));
    const workValuesData = await processCSVFile(path.join(extractedDir, 'Work Values.txt'));
    const interestsData = await processCSVFile(path.join(extractedDir, 'Interests.txt'));
    const workStylesData = await processCSVFile(path.join(extractedDir, 'Work Styles.txt'));

    // Transform data into our schema
    const occupations: Database['public']['Tables']['occupations']['Insert'][] = occupationsData.map(occ => {
      const code = occ['O*NET-SOC Code'] || '';
      
      // Get related tasks
      const tasks = tasksData
        .filter(task => task['O*NET-SOC Code'] === code)
        .map(task => ({
          id: task['Task ID'] || '',
          description: task.Task || '',
          type: task['Task Type'] || '',
          importance: parseFloat(task.Importance || '0'),
          frequency: parseFloat(task.Frequency || '0'),
        }));

      // Get related skills
      const skills = skillsData
        .filter(skill => skill['O*NET-SOC Code'] === code)
        .map(skill => ({
          id: skill['Element ID'] || '',
          name: skill.Skill || '',
          description: skill.Description || '',
          importance: parseFloat(skill.Importance || '0'),
          level: parseFloat(skill.Level || '0'),
        }));

      // Get related knowledge
      const knowledge = knowledgeData
        .filter(k => k['O*NET-SOC Code'] === code)
        .map(k => ({
          id: k['Element ID'] || '',
          name: k.Knowledge || '',
          description: k.Description || '',
          importance: parseFloat(k.Importance || '0'),
          level: parseFloat(k.Level || '0'),
        }));

      // Get related abilities
      const abilities = abilitiesData
        .filter(a => a['O*NET-SOC Code'] === code)
        .map(a => ({
          id: a['Element ID'] || '',
          name: a.Ability || '',
          description: a.Description || '',
          importance: parseFloat(a.Importance || '0'),
          level: parseFloat(a.Level || '0'),
        }));

      // Get related work context
      const workContext = workContextData
        .filter(wc => wc['O*NET-SOC Code'] === code)
        .map(wc => ({
          id: wc['Element ID'] || '',
          name: wc.Context || '',
          description: wc.Description || '',
          value: parseFloat(wc.Value || '0'),
        }));

      // Get related work values
      const workValues = workValuesData
        .filter(wv => wv['O*NET-SOC Code'] === code)
        .map(wv => ({
          id: wv['Element ID'] || '',
          name: wv.Value || '',
          description: wv.Description || '',
          score: parseFloat(wv.Score || '0'),
        }));

      // Get related interests
      const interests = interestsData
        .filter(i => i['O*NET-SOC Code'] === code)
        .map(i => ({
          id: i['Element ID'] || '',
          name: i.Interest || '',
          description: i.Description || '',
          score: parseFloat(i.Score || '0'),
        }));

      // Get related work styles
      const workStyles = workStylesData
        .filter(ws => ws['O*NET-SOC Code'] === code)
        .map(ws => ({
          id: ws['Element ID'] || '',
          name: ws.Style || '',
          description: ws.Description || '',
          importance: parseFloat(ws.Importance || '0'),
        }));

      return {
        code,
        title: occ.Title || '',
        description: occ.Description || '',
        tasks,
        skills,
        knowledge,
        abilities,
        work_context: workContext,
        work_values: workValues,
        interests,
        work_styles: workStyles,
        wages: {
          median: 0, // Will be populated from wage data
          range: {
            low: 0,
            high: 0,
          },
          currency: 'USD',
        },
        outlook: {
          growth_rate: 0, // Will be populated from outlook data
          projected_jobs: 0,
          projected_annual_openings: 0,
        },
        updated_at: new Date().toISOString(),
      };
    });

    // Insert data into Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    for (const occupation of occupations) {
      const { error } = await supabase
        .from('occupations')
        .upsert({
          ...occupation,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`Error upserting ${occupation.code}:`, error);
      } else {
        console.log(`Successfully synced ${occupation.code}`);
      }
    }

    console.log('O*NET data sync completed!');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

processOnetData();