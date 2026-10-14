// One source of truth for shots, captions and sound cues.
export const DURATION = 76;

export const SHOTS = [
  { id: 'title',       t0: 0,    t1: 3.0 },
  { id: 'street',      t0: 3.0,  t1: 6.5, hudKeep: true },
  { id: 'sec0',        t0: 6.5,  t1: 10.0 },
  { id: 'phone',       t0: 10.0, t1: 13.0 },
  { id: 'checkout',    t0: 13.0, t1: 16.5 },
  { id: 'atm',         t0: 16.5, t1: 20.0 },
  { id: 'airport',     t0: 20.0, t1: 23.5 },
  { id: 'hospital',    t0: 23.5, t1: 27.0 },
  { id: 'markets',     t0: 27.0, t1: 30.5 },
  { id: 'port',        t0: 30.5, t1: 34.0 },
  { id: 'supermarket', t0: 34.0, t1: 37.5 },
  { id: 'gas',         t0: 37.5, t1: 41.0 },
  { id: 'pharmacy',    t0: 41.0, t1: 44.5 },
  { id: 'chaos',       t0: 44.5, t1: 48.5 },
  { id: 'ration',      t0: 48.5, t1: 52.5 },
  { id: 'aerialNight', t0: 52.5, t1: 57.0 },
  { id: 'aerial1950',  t0: 57.0, t1: 61.5, hudKeep: true },
  { id: 'earth',       t0: 61.5, t1: 68.0, fadeIn: true },
  { id: 'earthDark',   t0: 68.0, t1: 72.0 },
  { id: 'end',         t0: 72.0, t1: 76.0 },
];

// **word** = accent colour
export const CAPTIONS = [
  { t0: 3.25,  t1: 6.4,   text: 'A normal morning. 5.5 billion people are online.' },
  { t0: 6.8,   t1: 9.9,   text: 'In one second, every connection on Earth goes **silent**.' },
  { t0: 10.25, t1: 12.9,  text: 'Your phone is now a flashlight with a camera.' },
  { t0: 13.25, t1: 16.4,  text: 'Every card payment on Earth is **declined**.' },
  { t0: 16.75, t1: 19.9,  text: 'Your savings are just numbers on a server you can’t reach.' },
  { t0: 20.25, t1: 23.4,  text: 'Airports freeze. Departure boards turn **red**.' },
  { t0: 23.75, t1: 26.9,  text: 'Hospitals lose every patient file. Doctors work **blind**.' },
  { t0: 27.25, t1: 30.4,  text: 'Stock markets shut down. Global trade stops moving.' },
  { t0: 30.75, t1: 33.9,  text: 'Ports can’t track a single container. Ships just wait.' },
  { t0: 34.25, t1: 37.4,  text: 'Shelves empty. The delivery trucks never come.' },
  { t0: 37.75, t1: 40.9,  text: 'Fuel runs out. Trucks, tractors and buses **stop**.' },
  { t0: 41.25, t1: 44.4,  text: 'Insulin and heart medication start running **out**.' },
  { t0: 44.75, t1: 48.4,  text: 'Fear spreads faster than any news could.' },
  { t0: 48.75, t1: 52.4,  text: 'Governments start rationing food and water.' },
  { t0: 52.75, t1: 56.9,  text: 'The modern world was built for 8 billion people. **Online.**' },
  { t0: 57.25, t1: 61.4,  text: 'The last time the world ran offline, it fed **2.5 billion**.' },
  { t0: 62.2,  t1: 64.9,  text: 'Today there are 8.2 billion of us…' },
  { t0: 65.1,  t1: 67.9,  text: '…and the system that fed them is **gone**.' },
  { t0: 68.4,  t1: 71.9,  text: 'No one knows how many would **survive**.' },
];

export const SFX = { shutoff: 6.5, glitch: [6.5, 6.9], heartbeatFrom: 44.5, earthFrom: 61.5 };
