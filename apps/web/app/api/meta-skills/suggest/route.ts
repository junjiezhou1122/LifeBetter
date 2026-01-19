import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MetaSkill, ItemStorage } from '@lifebetter/shared/types';

const STORAGE_PATH = path.join(process.env.HOME || '', '.lifebetter', 'problems.json');

async function readStorage(): Promise<ItemStorage> {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data);
    if (!storage.metaSkills) {
      storage.metaSkills = [];
    }
    return storage;
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], version: 2 };
  }
}

// Simple keyword-based matching for now
// In production, this would use embeddings/semantic search
function analyzeAndSuggest(title: string, description: string, metaSkills: MetaSkill[]) {
  const text = `${title} ${description}`.toLowerCase();
  const suggestions: Array<{
    metaSkill: MetaSkill;
    confidence: number;
    reason: string;
  }> = [];

  metaSkills.forEach(skill => {
    let confidence = 0;
    let reasons: string[] = [];

    // Pattern matching based on keywords
    const patterns: Record<string, { keywords: string[]; boost: number; reason: string }> = {
      'divide-and-conquer': {
        keywords: ['build', 'create', 'implement', 'system', 'large', 'complex', 'multiple', 'features'],
        boost: 0.3,
        reason: 'Large project that benefits from decomposition'
      },
      'read-docs-first': {
        keywords: ['learn', 'new', 'understand', 'how', 'what', 'documentation', 'api', 'library', 'framework'],
        boost: 0.25,
        reason: 'New technology or concept to learn'
      },
      'rubber-duck': {
        keywords: ['bug', 'error', 'why', 'not working', 'issue', 'problem', 'debug', 'fix'],
        boost: 0.25,
        reason: 'Debugging issue that needs systematic analysis'
      },
      'measure-first': {
        keywords: ['optimize', 'slow', 'performance', 'speed', 'improve', 'faster'],
        boost: 0.3,
        reason: 'Performance issue needs measurement before optimization'
      },
      'start-with-tests': {
        keywords: ['implement', 'feature', 'function', 'method', 'class', 'component'],
        boost: 0.2,
        reason: 'New feature benefits from test-driven development'
      },
      'break-into-chunks': {
        keywords: ['hours', 'days', 'week', 'long', 'time', 'estimate'],
        boost: 0.2,
        reason: 'Large time estimate suggests breaking into smaller chunks'
      }
    };

    // Check if skill name matches any pattern
    const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-');
    const pattern = patterns[skillKey];

    if (pattern) {
      // Count keyword matches
      const matches = pattern.keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > 0) {
        confidence = Math.min(0.95, pattern.boost + (matches * 0.1));
        reasons.push(pattern.reason);
      }
    }

    // Category-based matching
    if (skill.category === 'problem-solving' && (text.includes('solve') || text.includes('fix'))) {
      confidence += 0.15;
      reasons.push('Problem-solving approach needed');
    }
    if (skill.category === 'learning' && (text.includes('learn') || text.includes('understand'))) {
      confidence += 0.15;
      reasons.push('Learning-focused task');
    }
    if (skill.category === 'debugging' && (text.includes('bug') || text.includes('error'))) {
      confidence += 0.15;
      reasons.push('Debugging required');
    }

    // Boost based on past success
    if (skill.timesApplied > 0) {
      const successRate = skill.timesSuccessful / skill.timesApplied;
      confidence += successRate * 0.1;
      if (successRate > 0.7) {
        reasons.push(`High success rate (${Math.round(successRate * 100)}%)`);
      }
    }

    if (confidence > 0.3) {
      suggestions.push({
        metaSkill: skill,
        confidence: Math.min(confidence, 0.95),
        reason: reasons.join('. ')
      });
    }
  });

  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return suggestions.slice(0, 3); // Return top 3
}

// POST /api/meta-skills/suggest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemTitle, itemDescription = '', context = {} } = body;

    if (!itemTitle) {
      return NextResponse.json({ error: 'Item title is required' }, { status: 400 });
    }

    const storage = await readStorage();

    // Get active meta-skills
    const activeMetaSkills = storage.metaSkills.filter(ms => ms.isActive);

    if (activeMetaSkills.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Analyze and suggest
    const suggestions = analyzeAndSuggest(itemTitle, itemDescription, activeMetaSkills);

    // Format response
    const response = suggestions.map(s => ({
      metaSkillId: s.metaSkill.id,
      metaSkillName: s.metaSkill.name,
      metaSkillDescription: s.metaSkill.description,
      category: s.metaSkill.category,
      confidence: Math.round(s.confidence * 100) / 100,
      reason: s.reason,
      workflow: s.metaSkill.workflow,
      successRate: s.metaSkill.timesApplied > 0
        ? Math.round((s.metaSkill.timesSuccessful / s.metaSkill.timesApplied) * 100)
        : null
    }));

    return NextResponse.json({ suggestions: response });
  } catch (error) {
    console.error('Error suggesting meta-skills:', error);
    return NextResponse.json({ error: 'Failed to suggest meta-skills' }, { status: 500 });
  }
}
