Zombie Evolution — Music v4.0

Files:
- index_balanced_music_v4.html — complete game with v4 soundtrack engine integrated.
- ZombieMusicEngine_v4.js — standalone engine source.

Soundtrack design:
- 20 tracks grouped by gameplay mood: 4 calm exploration/idle, 6 combat,
  4 elite enemies, 3 boss themes, 1 final-boss theme, and 2 evolution themes.
- Distinct procedural timbres/arrangements: piano-like tones, bells, plucked tones,
  detuned string layers, brass-like synths, choir-like pads, industrial noise,
  tribal percussion and electronic arpeggios.
- No external audio files or libraries; uses Web Audio API.

Adaptive behavior:
- No enemy: calm ambient music.
- Normal enemy: energetic combat music.
- Elite enemy: denser, more distinctive arrangement.
- Boss: orchestral/brass/choir-weighted epic arrangement.
- Critical boss/player health: final intensity mode.
- Evolution: uplifting cinematic arrangement, then returns to combat or ambient.

Validation performed:
- Node syntax check on standalone engine.
- Extracted and syntax-checked both inline HTML script blocks.
- Confirmed 20 track definitions and mood pools.
- Confirmed existing attack handlers remain present in game source.

A real browser/audio-device test is still recommended for listening and input verification.
