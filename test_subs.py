from youtube_transcript_api import YouTubeTranscriptApi
import json

try:
    video_id = "ynVII7uwqs4"
    ytt_api = YouTubeTranscriptApi()
    
    transcript_list = ytt_api.list(video_id)
    
    # Check what transcripts are available
    for transcript in transcript_list:
        print(transcript.video_id, transcript.language, transcript.language_code, transcript.is_generated)
        
    tr_transcript_obj = transcript_list.find_transcript(['tr', 'tr-TR'])
    tr_data = tr_transcript_obj.fetch()
    
    en_transcript_obj = tr_transcript_obj.translate('en')
    en_data = en_transcript_obj.fetch()
    
    subtitles = []
    for tr, en in zip(tr_data, en_data):
        subtitles.append({
            "start": round(tr['start'], 2),
            "end": round(tr['start'] + tr['duration'], 2),
            "text": tr['text'],
            "translation": en['text']
        })
        
    print(json.dumps(subtitles[:3], indent=2, ensure_ascii=False))
    
except Exception as e:
    print("Error:", e)
