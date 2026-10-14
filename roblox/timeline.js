// Shots, captions, sound cues for "What if Roblox never existed?"
export const DURATION = 72;

export const SHOTS = [
  { id: 'title',    t0: 0,    t1: 3.2 },
  { id: 'office',   t0: 3.2,  t1: 7.2 },
  { id: 'kid2006',  t0: 7.2,  t1: 11.0 },
  { id: 'kid2010',  t0: 11.0, t1: 14.6 },
  { id: 'teen2016', t0: 14.6, t1: 18.6 },
  { id: 'lockdown', t0: 18.6, t1: 22.4 },
  { id: 'concert',  t0: 22.4, t1: 26.6 },
  { id: 'ipo',      t0: 26.6, t1: 30.4 },
  { id: 'meta',     t0: 30.4, t1: 34.2 },
  { id: 'gucci',    t0: 34.2, t1: 38.0 },
  { id: 'garden',   t0: 38.0, t1: 42.2 },
  { id: 'daily',    t0: 42.2, t1: 46.2 },
  { id: 'kidToday', t0: 46.2, t1: 50.4 },
  { id: 'earth',    t0: 50.4, t1: 57.0, fadeIn: true },
  { id: 'erase',    t0: 57.0, t1: 64.4, hudKeep: true },
  { id: 'quiet',    t0: 64.4, t1: 68.0 },
  { id: 'end',      t0: 68.0, t1: 72.0 },
];

// **word** = accent colour
export const CAPTIONS = [
  { t0: 3.45,  t1: 7.1,   text: '2004: two coders start a project called “DynaBlocks.” In this timeline, they **don’t**.' },
  { t0: 7.45,  t1: 10.9,  text: 'No blocky avatars. No obbies. No “**oof**.”' },
  { t0: 11.25, t1: 14.5,  text: 'Millions of kids never build their **first game**.' },
  { t0: 14.85, t1: 18.5,  text: 'Teenagers earning millions with their own games? **Never happens.**' },
  { t0: 18.85, t1: 22.3,  text: 'Lockdown. Millions of kids lose the place they met their **friends**.' },
  { t0: 22.65, t1: 26.5,  text: 'Giant virtual concerts? Just an **empty stage**.' },
  { t0: 26.85, t1: 30.3,  text: 'Wall Street never bets **$45 billion** on a kids’ game.' },
  { t0: 30.65, t1: 34.1,  text: 'Maybe Facebook never even renames itself **Meta**.' },
  { t0: 34.45, t1: 37.9,  text: 'A virtual bag worth more than the real one? It **never exists**.' },
  { t0: 38.25, t1: 42.1,  text: 'The biggest player record in gaming history, built by a **teenager**. Gone.' },
  { t0: 42.45, t1: 46.1,  text: 'More players than Germany has people. **Every single day.**' },
  { t0: 46.45, t1: 50.3,  text: 'Somewhere, a kid who would build the next giant game… **never starts**.' },
  { t0: 51.2,  t1: 56.9,  text: 'Every three months, players spend **3 million years** inside these worlds.' },
  { t0: 57.4,  t1: 60.9,  text: 'In this timeline, all of it…' },
  { t0: 61.1,  t1: 64.3,  text: '…never **existed**.' },
  { t0: 64.7,  t1: 67.9,  text: 'Same planet. One generation. **One world less.**' },
];

export const SFX = { erase: [5.3, 9.3, 24.4, 36.2, 40.2], earthReveal: 50.4, bigErase: 57.4 };
