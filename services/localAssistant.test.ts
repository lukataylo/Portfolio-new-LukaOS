import { describe, it, expect } from 'vitest';
import { generateLocalResponse, matchTopic, reflect } from './localAssistant';

describe('reflect', () => {
  it('swaps first/second person pronouns', () => {
    expect(reflect('I am tired of my job')).toBe('you are tired of your job');
    expect(reflect('you are a robot')).toBe('I am a robot');
  });

  it('preserves words it has no mapping for', () => {
    expect(reflect('the weather is grey')).toBe('the weather is grey');
  });
});

describe('matchTopic', () => {
  const cases: Array<[string, string]> = [
    ['hello there', 'greeting'],
    ['how are you doing?', 'how-are-you'],
    ['who is luka?', 'who-is-luka'],
    ['how many years of experience does he have', 'experience'],
    ['what are his skills', 'skills'],
    ['tell me about the case studies', 'cs-overview'],
    ['what is insyt', 'cs-insyt'],
    ['can I see the xtrade case study', 'cs-xtrade'],
    ['the telematics driving app', 'cs-driving'],
    ['unified dashboards in power bi', 'cs-dashboards'],
    ['can I hire luka', 'hire'],
    ['how do I contact him', 'contact'],
    ['where is he based', 'location'],
    ['how was this site built', 'site-tech'],
    ['why an operating system', 'why-os'],
    ['will ai take our jobs', 'ai-future'],
    ['tell me a joke', 'joke'],
    ['are you an ai', 'are-you-ai'],
    ['i need a new job', 'eliza-i-need'],
    ['i am anxious', 'anxiety'],
  ];

  it.each(cases)('routes %j to %s', (input, topic) => {
    expect(matchTopic(input)).toBe(topic);
  });

  it('returns fallback for unmatched input', () => {
    expect(matchTopic('xyzzy plugh quux')).toBe('fallback');
  });
});

describe('generateLocalResponse', () => {
  it('always returns a non-empty string', () => {
    for (const input of ['hi', 'who is luka', 'asdfghjkl', '', '   ', 'why']) {
      const out = generateLocalResponse([], input);
      expect(out).toBeTruthy();
      expect(out.length).toBeGreaterThan(0);
    }
  });

  it('reflects user content in ELIZA fallbacks', () => {
    // "I need ..." with no known topic falls through to the ELIZA rule, which
    // reflects the fragment back — every response for it echoes the noun.
    const out = generateLocalResponse([], 'I need a vacation').toLowerCase();
    expect(out).toContain('vacation');
  });

  it('answers a hiring question with a real contact path', () => {
    const out = generateLocalResponse([], 'I want to hire you').toLowerCase();
    expect(out).toMatch(/email|linkedin|luka\.dadiani@me\.com|sudo hire/);
  });
});
