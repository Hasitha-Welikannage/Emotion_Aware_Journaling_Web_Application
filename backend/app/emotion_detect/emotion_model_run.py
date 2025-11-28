import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

MODEL_PATH = "/Users/hasithawelikannage/Documents/GitHub/Emotion_Aware_Journaling_Web_Application/backend/app/emotion_detect/emotion_model"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)
model.to(device)
model.eval()

id2label = model.config.id2label

def analyze_emotions(text, max_length=512):
    # Split long text by characters first
    # Leave extra space for tokenizer's added special tokens
    char_chunk_size = 3000   # roughly maps to ~450-500 tokens depending on content
    text_chunks = [
        text[i:i + char_chunk_size]
        for i in range(0, len(text), char_chunk_size)
    ]

    probs_list = []

    for chunk in text_chunks:
        batch = tokenizer(
            chunk,
            truncation=True,
            padding="max_length",
            max_length=max_length,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            logits = model(**batch).logits
            probs = torch.sigmoid(logits).squeeze().cpu().numpy()
            probs_list.append(probs)

    avg_probs = np.mean(np.stack(probs_list), axis=0)

    results = {
        id2label[i]: round(float(avg_probs[i] * 100), 2)
        for i in range(len(avg_probs))
    }

    return dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
