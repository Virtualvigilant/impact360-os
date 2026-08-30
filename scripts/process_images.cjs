const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ARTIFACT_DIR = 'C:/Users/Blessing Orodi/.gemini/antigravity-ide/brain/9b442d58-8df8-49ab-b342-e25fd4bca822';
const TARGET_DIR = 'c:/Users/Blessing Orodi/Desktop/Projects/impact360-os/public/story';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const images = [
  {
    sourcePattern: 'story_apply_entrance',
    outputFile: '01-apply.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_review_desk',
    outputFile: '02-review.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_shortlist_wall',
    outputFile: '03-shortlist.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_interview_room',
    outputFile: '04-interview.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_assessment_bench',
    outputFile: '05-assessment.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_placement_desk',
    outputFile: '06-placement.webp',
    width: 2560,
    height: 1440,
  },
  {
    sourcePattern: 'story_og_social',
    outputFile: '00-og.webp',
    width: 1200,
    height: 630,
  },
];

async function main() {
  const artifactFiles = fs.readdirSync(ARTIFACT_DIR);

  for (const img of images) {
    const match = artifactFiles.find(f => f.startsWith(img.sourcePattern) && f.endsWith('.jpg'));
    if (!match) {
      console.error(`Could not find source image for ${img.sourcePattern}`);
      continue;
    }

    const srcPath = path.join(ARTIFACT_DIR, match);
    const destWebpPath = path.join(TARGET_DIR, img.outputFile);
    const destJpgPath = path.join(TARGET_DIR, img.outputFile.replace('.webp', '.jpg'));

    console.log(`Processing ${match} -> ${img.outputFile} (${img.width}x${img.height})...`);

    // WebP high quality
    await sharp(srcPath)
      .resize(img.width, img.height, { fit: 'cover', position: 'center' })
      .webp({ quality: 90, effort: 6 })
      .toFile(destWebpPath);

    // Also write JPG fallback
    await sharp(srcPath)
      .resize(img.width, img.height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(destJpgPath);

    console.log(`✓ Saved ${img.outputFile} and JPG fallback`);
  }

  console.log('All images processed successfully!');
}

main().catch(console.error);
