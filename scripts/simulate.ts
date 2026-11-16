import { simulate } from '../src/engine/simulate';

const scenarios = [
  { name: 'plays daily, 95% accurate', accuracy: 0.95, plays: undefined },
  { name: 'plays daily, 80% accurate', accuracy: 0.8, plays: undefined },
  { name: 'plays daily, 65% accurate', accuracy: 0.65, plays: undefined },
  { name: 'plays 5 days/week, 90%', accuracy: 0.9, plays: (d: number) => d % 7 < 5 },
  { name: 'plays 3 days/week, 90%', accuracy: 0.9, plays: (d: number) => [0, 2, 4].includes(d % 7) },
];
const RUNS = 100;
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] as number;

for (const sc of scenarios) {
  const firstWord: number[] = [], ten: number[] = [], secured8: number[] = [], set1: number[] = [], consolidation: number[] = [], per: number[] = [];
  for (let seed = 1; seed <= RUNS; seed++) {
    const { log } = simulate({ accuracy: sc.accuracy, days: 120, plays: sc.plays, seed });
    set1.push(log.find((d) => d.securedTotal >= 4)?.day ?? 999);
    firstWord.push(log.find((d) => d.wordsRead > 0)?.day ?? 999);
    ten.push(log.find((d) => d.wordsRead >= 10)?.day ?? 999);
    const d56 = [...log].reverse().find((d) => d.day <= 56);
    secured8.push(d56?.securedTotal ?? 0);
    consolidation.push(log.filter((d) => d.consolidation && d.day <= 56).length);
    per.push((d56?.securedTotal ?? 0) / 8);
  }
  console.log(
    `${sc.name.padEnd(28)} set 1 secure: day ${median(set1)} | first word read: day ${median(firstWord)} | 10 words read: day ${median(ten)}` +
      ` | sounds secure at day 56: ${median(secured8)} (avg ${median(per).toFixed(1)}/wk over 8 wks; capped at 23 by MVP content) | consolidation days in first 56: ${median(consolidation)}`,
  );
}
