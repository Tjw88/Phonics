# Evidence review: phonics for ages 3-5 (England)

**Provenance.** Compiled on 16 Nov 2026 by a research sub-agent using web search and page fetches. I (the assistant) have **not
independently re-read** these sources. Items marked *(search only)* were seen in a search result but the page was not opened.
Anything marked *not verified* could not be confirmed. Treat it as a well-sourced starting point, not settled fact, and
re-check a source before quoting it publicly.

## What it means for Soundling (decisions this review changed or supports)

| Finding | Strength | What we did / do |
|---|---|---|
| Pure sounds: the Reading Framework says enunciate phonemes clearly and avoid adding a schwa; /p/ /t/ /k/ can be said purely; /b/ /d/ /g/ "cannot be heard clearly in isolation unless a small schwa is added" | Strong (policy) | **Changed the sound generator:** /p t k/ are now burst + breathy release (no voiced vowel); /b d g/ keep a small faded vowel. No research gives a duration for a modelled sound, so our lengths are a judgement call, not evidence-based |
| Human voices for phoneme audio; no evidence that robotic voices harm learning, but none that they are fine for isolated sounds either | Weak | Neural voices are an improvement over espeak (a speech recogniser understood more words) but are **still a stand-in** for recordings by a trained voice; do not ship as final |
| Tap vs drag (ages 2-5): no overall difference in word learning; low-SES children learned more by dragging; only 4-year-olds transferred to real objects | Weak-moderate | Drag is now the primary gesture, with tap as a fallback; we do **not** claim drag teaches better |
| Movement / multisensory letter learning: promising at age ~7 (N=52), mixed and thin at 3-5; no controlled preschool study of tracing vs tapping found | Weak | Tracing stays optional and unclaimed as a benefit |
| Do not score children's speech: speech recognition on under-6s is poor (word error 15-58% in classrooms, 21-111% at home) and untested on isolated phonemes | Moderate | Speech stays unscored and the microphone stays unbuilt |
| Effective apps are active, engaged, meaningful and socially interactive (Hirsh-Pasek 2015); a 2021 meta-analysis found +0.31 SD but likely inflated; many popular apps give little in-play guidance | Moderate | Co-play hints, no autoplay, errorless start; plan a measured pilot rather than rely on the "educational" label |
| DfE screen-use guidance (ages 2-5): max 1 hour/day, avoid activities that respond automatically without effort, slow-paced and predictable content, no adverts, avoid autoplay, avoid AI tools "until better evidence exists" | Strong (guidance) | Daily limit defaults to 20 min; **to review:** our pre-rendered neural voice is not an interactive AI tool, but the "avoid AI" line is worth confirming with the DfE page |
| EYFS 2026: Reception ELG "say a sound for each letter in the alphabet and at least 10 digraphs" and blend into words; Development Matters (3-4s) centres on phonological awareness (rhyme, syllables, initial sounds), not letters | Strong | Ages 3-4 should lean on listening games (Safari, Rhyme Rocket, Robot Talk, Drum); letters are Reception-level. **Our Band B (age 2) game is too hard** (see AUDIT.md) |
| Colour/saturation: no study found on saturation in digital materials for 3-5s; the nearest evidence (Fisher 2014, N=24) is about *clutter and decoration*, not saturation | Weak / none | Vivid colour is a **design choice, not evidence-backed**. We keep backgrounds calm and reserve saturated colour for key objects (companions, eggs, tiles) as a precaution |

## 1. England policy (strong)

- **Reading Framework:** latest edition found is 22 Sep 2023 (correction to the 11 Jul 2023 revision); no 2025 or 2026 update listed.
  https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy
- **Validated SSP programmes:** 45 listed, page "Updated 11 November 2026" (does not say what changed); no imminent validation round.
  https://www.gov.uk/government/publications/choosing-a-phonics-teaching-programme/list-of-phonics-teaching-programmes
  Letters and Sounds (2007) removed from the validated list in 2022 *(search only)*; validation is not mandatory for schools *(search only)*.
- **EYFS (group and school-based), from 1 Sep 2026** (PDF read): Word Reading ELG quoted above; new para 3.94 "must have regard to" the DfE screen-use guidance.
  https://assets.publishing.service.gov.uk/media/6a5f8e4fb00f3323bf1a23a1/EYFS_group_and_school_based_from_September_2026.pdf
- **Development Matters** (non-statutory, Sep 2023): 3-4s = phonological awareness only; Reception = letter sounds and blending. The agent judged the age band from page layout.
  https://assets.publishing.service.gov.uk/media/64e6002a20ae890014f26cbc/DfE_Development_Matters_Report_Sep2023.pdf
- The Framework says daily phonics begins when children start Reception and sets no formal programme for Nursery.
  https://assets.publishing.service.gov.uk/media/664f600c05e5fe28788fc437/The_reading_framework_.pdf
- *Not verified:* Ofsted's current early-years inspection expectations.

## 2. Pronouncing isolated sounds (policy strong; empirical evidence weak or absent)

- Framework Appendix 6: "Teachers should enunciate phonemes clearly, and avoid adding schwa" (/s/ /p/ /or/ /t/ blends more easily than /suh/ /puh/ /or/ /tuh/). It is more nuanced than "never add uh": /p t k/ are unvoiced and can be said purely; /b d g j/ cannot be heard clearly alone unless a small schwa is added; /w y/ likewise; clusters are separate phonemes; say sounds "as purely and clearly as possible" and defer to programme guidance.
- **No durations are given**, and no study of how long a modelled sound should be, or schwa vs no schwa, was found. A Lancashire booklet says "cuh-a-tuh" makes blending hard *(search only; not research)*. https://www.lancashire.gov.uk/media/933477/phonics-booklet.pdf
- Webber et al. 2023 (extra blending training, Reception, N=222) is about blending training, not sound duration *(page blocked; details from search results only)*.

## 3. Saying sounds aloud; speech recognition (production effect moderate for memory, weak for phonics; ASR moderate, 3-5 evidence thin)

- Production effect in 5-year-olds, small lab study of picture names (not letter sounds): https://www.cambridge.org/core/journals/journal-of-child-language/article/abs/production-effect-in-memory-a-prominent-mnemonic-in-children/AE9B16C6CB58EE5E05E117C8EED6FBF0
- ASR for young children, 2025 review: 57.8% word error on 3-5s in classrooms (older system); a Whisper pipeline ~15-18% on US preschool child speech; home recordings 21-111%; noise 17% to 62% in one test. All word-level, conversational US English; **nothing on isolated phonemes**. https://arxiv.org/pdf/2509.18235

## 4. Gesture, movement, tracing, typing (contested to weak at 3-5)

- Embodied letter-sound RCT, N=52, ~7-year-olds, 4 weeks: movement-linked letter sounds beat regular teaching on naming and spelling. https://researchprofiles.ku.dk/en/publications/embodied-learning-activities-focusing-on-letter-sound-knowledge-i/
- Tablet vs paper graphomotor tasks (N=25, mean age 5.4): less accurate on tablet; authors doubted tablets for teaching handwriting. https://pmc.ncbi.nlm.nih.gov/articles/PMC5018499
- **Tap vs drag, ages 2-5** (Russo-Johnson 2017): no overall difference in word learning; low-SES children learned more by dragging; only 4-year-olds transferred to real objects. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00578/full
- *Not verified:* any controlled preschool comparison of tracing vs tapping for letter learning on touchscreens.

## 5. What makes apps effective (moderate)

- Four pillars (verified): active, engaged, meaningful, socially interactive; not every app needs all four. https://www.psychologicalscience.org/index.php/publications/educational-apps.html
- Meta-analysis, 36 studies / 285 effect sizes, preschool-Grade 3: mean +0.31 SD (literacy + maths); larger for preschool, researcher-made tests and constrained skills like letter-sound knowledge, so probably inflated. https://files.eric.ed.gov/fulltext/EJ1323865.pdf
- Design audit of popular preschool apps (2018): clear goals but few offered in-play guidance, rephrased instructions or adjustable difficulty. https://news.uci.edu/2018/09/19/most-preschool-math-literacy-apps-not-designed-to-help-children-learn-uci-study-finds
- **DfE screen-use guidance** (verified; provider guidance, not law for home apps): max 1 hour/day for 2-5s; no unsupervised use; avoid activities that give an automatic response without effort; slow-paced, repetitive, predictable, advert-free; avoid autoplay; avoid AI tools and AI-enabled toys "until better evidence exists"; "educational" labels don't guarantee quality. https://help-for-early-years-providers.education.gov.uk/health-and-wellbeing/screen-use
- *Not found:* a 2023-26 meta-analysis specific to phonics apps for under-5s.

## 6. Text-to-speech vs human voice (weak)

- No direct trial isolating TTS vs human narration for preschool phonics. Expressive voices produced more engagement in one small study (N=45, ages 4-7; the "TTS-like" voice was an actress imitating one). https://www.frontiersin.org/articles/10.3389/fnhum.2017.00295
- Older low-quality synthesisers lowered word identification in preschoolers (N=18). https://experts.umn.edu/en/publications/synthesized-speech-intelligibility-and-early-preschool-age-childr/
- A voice agent matched a human partner for story comprehension with dialogic reading (N=117, ages 3-6, single session, higher-SES). https://academic.oup.com/chidev/article/93/2/e149/8255019
- *Not verified:* any evidence that robotic voices harm learning, or on TTS quality for isolated phonemes (stops are the likely weak point: the agent's inference, and ours).

## 7. Engagement, spacing, rewards, regulation

- Spacing/retrieval in 4;10-year-olds (N=28, novel nouns): expanding vs equal spacing did not differ; word learning only. https://pmc.ncbi.nlm.nih.gov/articles/PMC11087082/
- Rewards: contested; no preschool-specific evidence found *(search only)*. Session length: no age-specific evidence; only anchor is DfE's 1-hour ceiling.
- **UK Children's Code** (15 standards incl. nudge techniques, data minimisation). https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
- **COPPA** amended rule effective 23 Jun 2025, compliance deadline 22 Apr 2026; biometric identifiers now personal information; other changes not verified. https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm
- **Apple Kids Category** (guidelines 1.3, 5.1.4): no third-party analytics/ads; parental gate for links and purchases; 2025-26 changes not verified. https://developer.apple.com/app-store/review/guidelines/

## 8. Colour (weak; no solid evidence on saturation)

- Fisher et al. 2014 (N=24 kindergartners): more off-task in heavily decorated rooms; about clutter and decoration, not saturation; a commentary suggests novelty effects that habituate *(search only)*. https://www.cmu.edu/news/stories/archives/2014/may/may27_decoratedclassrooms.html
- Stern-Ellran 2016 (N=15, ages 3-4): a colourful play surface disrupted structured play vs white; tiny, unreplicated. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01661/pdf
- Many web claims about saturation and learning cite sources (NAEYC, MIT) that could not be traced; the agent did not use them.
- *Not verified:* any study comparing saturation in digital learning materials for 3-5s, or children's colour preferences and learning.

## Pages that could not be opened

pubmed.ncbi.nlm.nih.gov/37984992 (blocked), educationendowmentfoundation.org.uk (403, so the EEF Early Years Toolkit was not checked), doaj.org (403), the Deci et al. PDFs, federalregister.gov, journals.sagepub.com.
