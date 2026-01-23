/**
 * Download exercise GIFs from ExerciseDB API and save locally
 *
 * Usage: node scripts/downloadExerciseGifs.js YOUR_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_HOST = 'exercisedb.p.rapidapi.com';
const IMAGE_URL = 'https://exercisedb.p.rapidapi.com/image';

async function downloadGif(apiKey, exerciseId, outputPath) {
  const url = `${IMAGE_URL}?exerciseId=${exerciseId}&resolution=360`;

  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': API_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);

  return buffer.length;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error('Uso: node scripts/downloadExerciseGifs.js API_KEY');
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(__dirname, '../public/exercises');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read exercise data
  const gifsPath = path.join(__dirname, 'exercise-gifs.json');
  const exercises = JSON.parse(fs.readFileSync(gifsPath, 'utf-8'));

  const exerciseIds = Object.keys(exercises);
  let downloaded = 0;
  let errors = [];

  console.log(`\nBaixando ${exerciseIds.length} GIFs...\n`);

  for (let i = 0; i < exerciseIds.length; i++) {
    const exerciseId = exerciseIds[i];
    const apiId = exercises[exerciseId].apiId;
    const outputPath = path.join(outputDir, `${exerciseId}.gif`);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      console.log(`[${i + 1}/${exerciseIds.length}] ${exerciseId} - ja existe, pulando`);
      downloaded++;
      continue;
    }

    console.log(`[${i + 1}/${exerciseIds.length}] ${exerciseId} (ID: ${apiId})...`);

    try {
      const size = await downloadGif(apiKey, apiId, outputPath);
      console.log(`   -> OK (${Math.round(size / 1024)}KB)`);
      downloaded++;
    } catch (error) {
      console.log(`   -> ERRO: ${error.message}`);
      errors.push({ exerciseId, apiId, error: error.message });
    }

    // Rate limiting - wait between requests
    if (i < exerciseIds.length - 1) {
      await delay(700);
    }
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Total: ${exerciseIds.length}`);
  console.log(`Baixados: ${downloaded}`);
  console.log(`Erros: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nExercicios com erro:');
    errors.forEach(e => console.log(`  - ${e.exerciseId}: ${e.error}`));
  }

  console.log(`\nGIFs salvos em: ${outputDir}`);
}

main();
