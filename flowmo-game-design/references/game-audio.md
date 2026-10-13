# Game audio: scope and mix

What a typical small game build needs, and the loudness relationship between
its layers. Generate clips through whichever f0 audio-generation tool the
surface exposes (Designer: `generate_audio_asset`); this reference covers scope
and mix judgment, not a specific model or provider.

The loudness numbers below are also captured as structured data in this
package's `audio-mix-targets` preset (declared in SKILL.md's frontmatter).

## Scope

Keep a small build's audio list short and purposeful rather than exhaustive:

- **Music:** at most two looping tracks. One per major scene/state is usually
  enough - do not generate a unique track per screen by default.
- **SFX:** prioritize in this order - the player's primary verb, damage/feedback,
  pickup/reward, one important environmental cue, then a single ambience layer.
  Roughly five essential effects covers a small build; anything past that should
  be a deliberate addition, not default coverage.
- **Voice:** lock one voice per speaking entity and reuse it consistently. Keep
  lines short enough that they do not block gameplay while they play out.

Generate independent clips concurrently (they do not depend on each other), but
make sure every clip actually resolves before wiring it into the game - a
manifest entry with nothing behind it is worse than no audio.

## Prompt discipline

- One sound per SFX prompt - never ask for a whole mixed scene in one clip.
- State explicitly when isolation matters: no music, no voice, no ambience.
- Music prompts carry mood, tempo, and instrumentation, plus "instrumental / no
  vocals" whenever lyrics are unwanted.
- Voice prompts carry the exact line; keep performance direction inside the
  prompt itself rather than relying on undocumented flags.
- Keep the same visual style language consistent in audio prompts too - the
  material, era, and energy of the game's look should carry into how its sounds
  are described, even though audio is not visual.

## Mix and ear safety

Normalize every clip before it goes into the game, not after something already
sounds too loud:

- Voice around -6 dBFS.
- SFX around -10 to -12 dBFS.
- Music/ambience around -18 to -20 dBFS.
- Final true peak at or below -3 dBFS once every layer is mixed together.

The ordering matters as much as the numbers: voice sits above SFX, SFX sits
above music. Loop ambience and music in playback code with a short fade at each
loop boundary rather than a hard cut. Never stack raw generated clips at full
gain and call it mixed.

## Verification before shipping

- Every audio reference actually resolves - no silently broken links in the
  manifest.
- Autoplay restrictions are respected: start or resume the audio context from an
  actual user gesture, not on page load.
- Pause or mute audio when the page/tab loses focus, if that matches the game's
  profile (a real-time competitive game may want to keep running muted instead
  of pausing; a single-player puzzle usually pauses).
- The game stays fully playable with sound disabled - never gate information the
  player needs behind audio alone.
- Test on phone speakers as well as headphones whenever mobile is in the
  platform target - a mix balanced only on headphones often loses the low end
  and the SFX/music balance on a phone speaker.
