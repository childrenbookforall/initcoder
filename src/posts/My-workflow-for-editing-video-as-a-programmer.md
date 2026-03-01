---
title: My workflow for editing and compiling videos as a programmer
description: I decided to edit and compile my videos using mpv, ffmpeg, whisper and a notebook. Here's my workflow.
pubDate: 2026-01-26
---

# The task

My everyday work does not involve editing or compiling videos. However, a not-for-profit community project [[1]](#notes) my wife and I work on just completed two years of its existence. We received several 'happy birthday' messages from the community members and what the community meant for them. 
I decided to edit and compile them together to present it to the community and also put it up on our social media platform [[2]](#notes).

# Gathering the tools for the job

I haven't used any video editing software for more than a decade now - but when I did it was a very bad experience. I remember the clunky application, terrible UI, lags, long wait times, losing my work because of the app crashing midway and having to re-do everything again. Maybe the video editing softwares today have become better at their job but I did not have the heart to try.
I decided to do it the old cli-way - `mpv`[[3]](#notes) (to watch the videos), using my _notebook_ (for keeping record of timestamps of edits), `ffmpeg`[[4]](#notes) (for edits and compilations) and `whisper`[[5]](#notes) (for adding the subtitle track in the video).

# Watching the videos and segmenting them into several meaningful chunks

I wanted to watch all the videos and segment them into several meaningful clips.
I use `mpv` to watch my videos. The default format of the timestamp displayed on mpv is HH:MM:SS. However, I wanted to get the millisecond view for more precise cuts. 

We can enable the millisecond view by launching the video with `--osd-fractions` flag like this:

```
mpv --osd-fractions video1.mp4
```

`mpv` also has a very handful way to step forward or backward a frame using `.` and `,`. This allowed me to get very accurate timestamps for my cuts.

I use ffmpeg to cut these segments from the videos based on the time stamp like this

```
ffmpeg -i video1.mp4 -ss 00:00:16.232 -to 00:00:25.371 clip1.mp4 
```

I manually did this for each of the segments for each of the videos. However, I could have written a bash script for this. Here's what my bash script would have looked like:

```
#makeVideoCuts.sh
#!/bin/bash
mkdir clips
FILE=cuts.csv
number=0
{
  read #skip header
  while IFS=',' read -r file start end; do
      ffmpeg -nostdin -i "$file" -ss "$start" -to "$end" "./clips/clip$((++number)).mp4"
    done
} < "$FILE"
```

This would work for my cut timestamps stored in a csv file.
```
# cuts.csv
File,Start,End
video1.mp4,00:00:16.232,00:00:25.371
video1.mp4,00:00:27.412,00:00:45.643
...

```

# Preparing to join the clips
Now, I had all the clips I wanted to work with numbered in a folder. These clips now had the default video and audio encoding for ffmpeg. However, before I could join them, I needed to do two things:
1. **Make the resolution for all the clips uniform**  
These clips had been recorded from different devices, and so they had different resolutions. Before I could join them, I wanted to make their resolutions uniform.

This script did this for me.
```
for file in *.mp4; do
    ffmpeg -nostdin -i "$file" -vf scale=1080:1920 "scaled_$file"
done
```
2. **Organize and order all clips into a small set of thematic categories**  
This was a manual task, where I had to watch each of the clips again, and categorize them into a set of broader themes. My wife also helped me with this exercise. For the clips I had segmented, we could group them into 6 broad themes - happy birthday greetings, their journey in the community, about the present state of the community, how it has held them and others, what the community means for them and expressions of gratitude.

In a notebook, I put the clip video numbers for each category in the order that seemed most appropriate.

```
#notebook
greetings - 1,7,12 ...
journey - 2,5,14 ...
present - 3,6,11 ...
holding - 4,16 ...
meaning - 10,15 ...
gratitude - 9,21 ...
```

# Joining the clips
Since all the videos are of the same resolution and encoding, I could join them using concat demuxer. I decided to join them theme-wise.

```
mkdir themes
```

```
# merge.sh
#merge clips of the same theme in the desired order
touch temp.txt
order=(1 7 12 ...)
for n in "${order[@]}"; do
    echo "file 'scaled_clip$n.mp4'" >> temp.txt
done

ffmpeg -f concat -safe 0 -i temp.txt -c:v libx264 -c:a aac -crf 28 themes/themeName.mp4
rm temp.txt
```

I ran this script for different themes by changing the numbers in the array for `order` variable and the name of output file. Now I had 6 different merged clips of videos for the different themes.

# Hardcoding subtitle track on the videos 

I wanted to hardcode the subtitle track on the videos for accessibility reasons. I decided to use `whisper` and `ffmpeg` for this. I extracted the audio from the videos first and then used the audio as an input to generate the srt file. Then I used the srt file to hardcode the subtitle track into the video.

```
#addSubtitle.sh
mkdir subtitledVideos
for file in *.mp4; do
    fileName="${file%.*}"
    ffmpeg -i "$file" -vn -acodec mp3 "${fileName}.mp3"
    whisper "${fileName}.mp3" --model small --language English --output_format srt
    ffmpeg -i "$file" -vf subtitles="${fileName}.srt" "subtitledVideos/${fileName}.mp4"
done
````

# The final Video

To generate the final video, I manually listed the files in the order I wanted them to be merged.

```
#finalVideo.txt
file 'greetings.mp4'
file 'journey.mp4'
...

```

I then joined them using concat demuxer.

```
ffmpeg -f concat -safe 0 -i finalVideo.txt -c:v libx264 -c:a aac -crf 28 finalVideo.mp4
```

This is how my video editing and compilation flow looked like.   
_How would you do it?_

# Notes

1. Using illustrated children's book with people of all ages to anchor conversations around mental health and complex socio-emotional issues 
(https://childrensbookforall.org) 
2. The final edited video on our Instagram platform (https://www.instagram.com/p/DT78pUfEwK1/)
3. A free, open source, and cross-platform media player (https://mpv.io)
4. A complete, cross-platform solution to record, convert and stream audio and video (https://www.ffmpeg.org/)
5. A speech recognition engine (https://github.com/openai/whisper)