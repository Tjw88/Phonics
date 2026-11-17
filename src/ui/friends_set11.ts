import { cheeks, eyes, face } from './friendKit';

// Sound-friends of set(s) ow oi ear air er. Each entry is an SVG fragment (viewBox 0 0 120 120) in the style of the existing friends.
// Hairy's bristles: rows of round-tipped dots on the pad, above and below the face.
const bristles = [14, 22, 30, 70, 78].map((y) => {
  const hw = 36 * Math.sqrt(Math.max(0, 1 - ((y - 46) / 36) ** 2)) - 5;
  const n = Math.max(0, Math.floor(hw / 8.5));
  let out = '';
  for (let k = -n; k <= n; k++) out += `<circle cx="${60 + k * 8.5}" cy="${y}" r="3.3" fill="#4cc3d9"/><circle cx="${60 + k * 8.5 - 0.3}" cy="${y - 0.6}" r="1.7" fill="#fff"/>`;
  return out;
}).join('');

export const FRIENDS_SET11: Record<string, string> = {
  // ow: Howie the owl, round and fluffy, hooting
  ow: `<path d="M104 30 q9 8 0 18 M112 22 q15 17 0 34" stroke="#ffb703" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     <path d="M12 38 q-8 -6 -9 -14 M20 30 q-12 -8 -13 -20" stroke="#ffb703" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     <path d="M24 44 L20 12 L48 28Z M96 44 L100 12 L72 28Z" fill="#8a5a2b"/><path d="M28 38 L25 21 L41 30Z M92 38 L95 21 L79 30Z" fill="#d9a066"/>
     <ellipse cx="60" cy="72" rx="42" ry="42" fill="#8a5a2b"/><ellipse cx="60" cy="70" rx="42" ry="41" fill="#b8793a"/>
     <path d="M18 66 Q8 94 30 104 Q38 86 34 66Z" fill="#8a5a2b"/><path d="M102 66 Q112 94 90 104 Q82 86 86 66Z" fill="#8a5a2b"/>
     <ellipse cx="60" cy="90" rx="24" ry="24" fill="#fff3d6"/>
     <path d="M48 84 q6 6 12 0 q6 6 12 0 M42 96 q6 6 12 0 q6 6 12 0 M50 106 q6 5 10 0 q6 5 10 0" stroke="#e8c48a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
     <circle cx="43" cy="52" r="17" fill="#fff3d6"/><circle cx="77" cy="52" r="17" fill="#fff3d6"/><circle cx="43" cy="52" r="17" fill="none" stroke="#d9a066" stroke-width="3"/><circle cx="77" cy="52" r="17" fill="none" stroke="#d9a066" stroke-width="3"/>
     ${eyes(43, 77, 52, 10)}
     <path d="M52 62 L68 62 L60 70Z" fill="#ff9f1c"/><ellipse cx="60" cy="78" rx="7" ry="6" fill="#6b2437"/><path d="M53 72 Q60 69 67 72 Q64 76 60 76 Q56 76 53 72Z" fill="#ff9f1c"/>
     ${cheeks(24, 96, 70, 5)}
     <ellipse cx="46" cy="116" rx="10" ry="4.6" fill="#ff9f1c"/><ellipse cx="74" cy="116" rx="10" ry="4.6" fill="#ff9f1c"/>`,
  // oi: Coco the coin, a face on her golden face, spinning with motion arcs
  oi: `<path d="M14 40 q-8 22 0 44 M6 30 q-14 32 0 64" stroke="#ffd166" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M106 40 q8 22 0 44 M114 30 q14 32 0 64" stroke="#ffd166" stroke-width="4" fill="none" stroke-linecap="round"/>
     <g transform="rotate(-10 60 64)"><circle cx="60" cy="64" r="46" fill="#d68a14"/><circle cx="60" cy="64" r="42" fill="#ffc23d"/><circle cx="60" cy="64" r="35" fill="#ffd166"/>
     <circle cx="60" cy="64" r="35" fill="none" stroke="#e8a21f" stroke-width="2.6"/><circle cx="60" cy="64" r="39" fill="none" stroke="#fff" stroke-width="2.6" opacity=".5" stroke-dasharray="1 7" stroke-linecap="round"/>
     <path d="M34 42 q8 -14 24 -16" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>${face(60, 62, 1.3)}</g>
     <path d="M96 12 L99 20 L107 23 L99 26 L96 34 L93 26 L85 23 L93 20Z" fill="#fff"/><path d="M22 14 L24 19 L29 21 L24 23 L22 28 L20 23 L15 21 L20 19Z" fill="#fff3b0"/><path d="M104 104 L106 109 L111 111 L106 113 L104 118 L102 113 L97 111 L102 109Z" fill="#fff3b0"/>`,
  // ear: Earl the ear, a big peach ear with a smile and tiny arms and feet
  ear: `<path d="M32 70 q-18 -4 -20 -22" stroke="#e8a479" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="12" cy="46" r="7" fill="#ffc59a"/>
     <path d="M92 74 q18 -2 18 -22" stroke="#e8a479" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="110" cy="50" r="7" fill="#ffc59a"/>
     <ellipse cx="48" cy="114" rx="11" ry="5" fill="#52b8a5"/><ellipse cx="74" cy="114" rx="11" ry="5" fill="#52b8a5"/>
     <path d="M62 6 C92 4 108 30 102 62 C99 80 88 86 84 98 C80 112 60 114 52 100 C48 92 52 86 44 80 C28 66 30 14 62 6Z" fill="#e8a479"/>
     <path d="M62 4 C92 2 106 28 100 60 C97 78 86 84 82 96 C78 108 60 110 54 98 C50 90 54 84 46 78 C30 64 32 12 62 4Z" fill="#ffc59a"/>
     <path d="M60 14 C82 12 94 32 88 56 C85 68 78 74 76 86" stroke="#f0b087" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
     <path d="M42 30 q6 -12 20 -14" stroke="#fff" stroke-width="4.6" fill="none" opacity=".6" stroke-linecap="round"/>
     <path d="M52 40 C58 30 70 32 72 42" stroke="#f0b087" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8"/>
     ${face(70, 62, 1.15)}`,
  // air: Hairy the hairbrush, a violet paddle brush seen from the front: bristle grid on the pad, a face in the middle, a handle below
  air: `<rect x="49" y="78" width="22" height="42" rx="10" fill="#5a49b8"/><rect x="51" y="76" width="18" height="42" rx="9" fill="#7b69d8"/><path d="M56 90 v18" stroke="#fff" stroke-width="3.4" opacity=".5" stroke-linecap="round"/><circle cx="60" cy="112" r="3.4" fill="#5a49b8"/>
     <rect x="52" y="74" width="16" height="8" rx="3" fill="#4cc3d9"/>
     <ellipse cx="60" cy="48" rx="42" ry="42" fill="#5a49b8"/><ellipse cx="60" cy="46" rx="42" ry="42" fill="#8b7be8"/><ellipse cx="60" cy="46" rx="36" ry="36" fill="#a99df2"/>
     ${bristles}
     <path d="M30 24 q6 -10 18 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
     ${eyes(48, 72, 44, 7.5)}${cheeks(37, 83, 55, 5)}<path d="M47 54 Q60 67 73 54" fill="none" stroke="#3b2030" stroke-width="3.2" stroke-linecap="round"/>`,
  // er: Fern the fern, a plump frond with pairs of leaflets, a face and a curling tip
  er: `<ellipse cx="48" cy="116" rx="10" ry="4.6" fill="#8a5a2b"/><ellipse cx="72" cy="116" rx="10" ry="4.6" fill="#8a5a2b"/>
     <ellipse cx="25.8" cy="84.1" rx="26.0" ry="6.2" fill="#3c9a4b" transform="rotate(232 25.8 84.1)"/><ellipse cx="96.2" cy="84.1" rx="26.0" ry="6.2" fill="#3c9a4b" transform="rotate(-52 96.2 84.1)"/><ellipse cx="26.8" cy="75.9" rx="24.3" ry="6.2" fill="#3c9a4b" transform="rotate(232 26.8 75.9)"/><ellipse cx="95.2" cy="75.9" rx="24.3" ry="6.2" fill="#3c9a4b" transform="rotate(-52 95.2 75.9)"/><ellipse cx="27.8" cy="67.7" rx="22.5" ry="6.2" fill="#3c9a4b" transform="rotate(232 27.8 67.7)"/><ellipse cx="94.2" cy="67.7" rx="22.5" ry="6.2" fill="#3c9a4b" transform="rotate(-52 94.2 67.7)"/><ellipse cx="28.8" cy="59.5" rx="20.8" ry="6.2" fill="#3c9a4b" transform="rotate(232 28.8 59.5)"/><ellipse cx="93.2" cy="59.5" rx="20.8" ry="6.2" fill="#3c9a4b" transform="rotate(-52 93.2 59.5)"/><ellipse cx="29.8" cy="51.3" rx="19.1" ry="6.2" fill="#3c9a4b" transform="rotate(232 29.8 51.3)"/><ellipse cx="92.2" cy="51.3" rx="19.1" ry="6.2" fill="#3c9a4b" transform="rotate(-52 92.2 51.3)"/><ellipse cx="30.8" cy="43.1" rx="17.4" ry="6.2" fill="#3c9a4b" transform="rotate(232 30.8 43.1)"/><ellipse cx="91.2" cy="43.1" rx="17.4" ry="6.2" fill="#3c9a4b" transform="rotate(-52 91.2 43.1)"/><ellipse cx="31.9" cy="34.9" rx="15.6" ry="6.2" fill="#3c9a4b" transform="rotate(232 31.9 34.9)"/><ellipse cx="90.1" cy="34.9" rx="15.6" ry="6.2" fill="#3c9a4b" transform="rotate(-52 90.1 34.9)"/><ellipse cx="32.9" cy="26.7" rx="13.9" ry="6.2" fill="#3c9a4b" transform="rotate(232 32.9 26.7)"/><ellipse cx="89.1" cy="26.7" rx="13.9" ry="6.2" fill="#3c9a4b" transform="rotate(-52 89.1 26.7)"/>
     <ellipse cx="24.8" cy="82.5" rx="26.0" ry="6.2" fill="#6fd37e" transform="rotate(232 24.8 82.5)"/><ellipse cx="95.2" cy="82.5" rx="26.0" ry="6.2" fill="#6fd37e" transform="rotate(-52 95.2 82.5)"/><ellipse cx="25.8" cy="74.3" rx="24.3" ry="6.2" fill="#6fd37e" transform="rotate(232 25.8 74.3)"/><ellipse cx="94.2" cy="74.3" rx="24.3" ry="6.2" fill="#6fd37e" transform="rotate(-52 94.2 74.3)"/><ellipse cx="26.8" cy="66.1" rx="22.5" ry="6.2" fill="#6fd37e" transform="rotate(232 26.8 66.1)"/><ellipse cx="93.2" cy="66.1" rx="22.5" ry="6.2" fill="#6fd37e" transform="rotate(-52 93.2 66.1)"/><ellipse cx="27.8" cy="57.9" rx="20.8" ry="6.2" fill="#6fd37e" transform="rotate(232 27.8 57.9)"/><ellipse cx="92.2" cy="57.9" rx="20.8" ry="6.2" fill="#6fd37e" transform="rotate(-52 92.2 57.9)"/><ellipse cx="28.8" cy="49.7" rx="19.1" ry="6.2" fill="#6fd37e" transform="rotate(232 28.8 49.7)"/><ellipse cx="91.2" cy="49.7" rx="19.1" ry="6.2" fill="#6fd37e" transform="rotate(-52 91.2 49.7)"/><ellipse cx="29.8" cy="41.5" rx="17.4" ry="6.2" fill="#6fd37e" transform="rotate(232 29.8 41.5)"/><ellipse cx="90.2" cy="41.5" rx="17.4" ry="6.2" fill="#6fd37e" transform="rotate(-52 90.2 41.5)"/><ellipse cx="30.9" cy="33.3" rx="15.6" ry="6.2" fill="#6fd37e" transform="rotate(232 30.9 33.3)"/><ellipse cx="89.1" cy="33.3" rx="15.6" ry="6.2" fill="#6fd37e" transform="rotate(-52 89.1 33.3)"/><ellipse cx="31.9" cy="25.1" rx="13.9" ry="6.2" fill="#6fd37e" transform="rotate(232 31.9 25.1)"/><ellipse cx="88.1" cy="25.1" rx="13.9" ry="6.2" fill="#6fd37e" transform="rotate(-52 88.1 25.1)"/>
     <ellipse cx="60" cy="72" rx="30" ry="40" fill="#5cc26b"/><ellipse cx="60" cy="70" rx="29" ry="39" fill="#8ee27a"/>
     <path d="M60 32 C60 14 80 8 85 22 C88 36 70 38 70 27" stroke="#3c9a4b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M60 32 C60 14 80 8 85 22 C88 36 70 38 70 27" stroke="#6fd37e" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     <path d="M40 40 q6 -12 18 -14" stroke="#fff" stroke-width="4.4" fill="none" opacity=".5" stroke-linecap="round"/>
     ${face(60, 70, 1.15)}`,
};
