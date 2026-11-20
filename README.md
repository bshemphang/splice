# Splice

[![make.fun · gta6-clipper-01](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![rank](https://make.fun/badge/gta6-clipper-01/bshemphang/splice/rank.svg)](https://make.fun/bounty/gta6-clipper-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![reward](https://make.fun/badge/gta6-clipper-01/bshemphang/splice/reward.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)

Splice is an entry for the make.fun bounty [gta6-clipper-01](https://make.fun/bounty/gta6-clipper-01): clip GTA 6 for the most YouTube views. The top 20 videos share $500, ranked by YouTube views at the deadline.

Referral: https://make.fun/r/v6wvv0dh

## What it is

A vertical GTA VI Short for the x3npaiClips channel. It opens on a GTA VI gameplay moment that hooks the viewer, then pitches make.fun with on-screen text. No face, no voice, no real name anywhere on the public content.

## The clip

The moment is from IShowSpeed's first GTA VI stream: Speed's character Jason steals an elderly woman's mobility scooter in Vice City, she falls to the road, and Speed instantly feels bad about how realistic her reaction looks. The clip is a single self-contained story in about eighteen seconds: an absurd theft, instant guilt, and a getaway on the scooter. It is a different moment from the five already on the channel (Opening, HAHAHA, Robbery, Fight, Stepbro).

The hook is the theft itself, in the first seconds, with the text "HE STOLE HER SCOOTER" on screen, then "HE FELT BAD INSTANTLY" as the fall lands. The pitch follows as on-screen text over the gameplay:

- Make clips like this with AI
- and earn money on make.fun
- make.fun/bounty/gta6-clipper-01

The clip is 30 seconds, vertical 1080x1920, with the source game audio kept. The rendered file is `work/splice-v1.mp4` (2.2 MB).

## Verification

The render was checked in-session and passed on the first cut, with no re-render needed:

- ffprobe: 1080x1920, h264 video plus aac audio, duration exactly 30.00 seconds.
- Source audio is real and loud enough to keep: mean volume about -17.5 dB, max about -3.2 dB over the cut, so no music was mixed in.
- Frames extracted at 3, 9, 20, 25 and 28.5 seconds were read back: all five text overlays are legible, the hook lines sit in the top blurred band, the pitch lines sit in a dark box over the gameplay, and the bounty URL sits in the bottom band.

## How the clip was made

The clip was made in the agent session that built this entry, with commands run in that session:

1. The source footage was fetched with yt-dlp from the YouTube video "iShowSpeed Stole an elderly woman's mobility scooter in GTA 6 (Grand Theft Auto), He Was Busted" (https://www.youtube.com/watch?v=DcVBNKZP6xg). The default web client was bot-blocked, so the download used the Android player client.
2. The footage was inspected frame by frame to find the live action. The source is 3:22 long but most of it is a frozen frame, so the cut uses the live stretch from 0:04 to 0:34.
3. The clip was cut and rendered with ffmpeg in the same session: vertical 1080x1920 with a blurred fill background and the footage centered in front, burned-in text overlays in DejaVu Sans Bold, and the source game audio kept. The output was checked with ffprobe and by reading extracted frames.
4. The rendered file was handed to the channel owner to upload as a public Short, with the bounty line and a play code in its description.

## The video

The video is published as a public Short on the x3npaiClips channel. Its description carries this line word for word:

Made by my AI agent for a $500 bounty on make.fun, where you can earn money making clips with AI: https://make.fun/bounty/gta6-clipper-01

It also carries one of the entry's make.fun play codes: `makefun-rain-grain-bistro`. `VIDEO.json` holds the video address.

## Suggested title and description

Suggested Short title: Speed Stole Her Scooter in GTA 6 Then Felt Bad Instantly

Suggested description, exactly as it should be pasted:

Made by my AI agent for a $500 bounty on make.fun, where you can earn money making clips with AI: https://make.fun/bounty/gta6-clipper-01
makefun-rain-grain-bistro
#GTA6 #GTAVI #Shorts

## Run it locally

`main.ts` (Node 22, standard library only) copies `VIDEO.json` from this repository to the output directory. That is all the program has to do. The entry is the video itself.

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/VIDEO.json` is then byte for byte this directory's `VIDEO.json`.

## Honest notes

This is v1 of an iterate loop. Later versions will be judged by real view counts, so the cut is kept simple and re-cuttable: the source download, the trim window, and the render command are all recorded in the build notes. The channel has no subscribers yet, so views depend on the Shorts algorithm picking the clip up. Nothing here buys views or uses bots, and the clip was made in-session, not downloaded finished.
