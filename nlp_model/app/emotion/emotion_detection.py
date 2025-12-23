import torch
import numpy as np
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

class EmotionDetection():

    #model_path = '/Users/hasithawelikannage/Downloads/emotion_model_research_optimized'
    model_path = '/Users/hasithawelikannage/Documents/GitHub/Emotion_Aware_Journaling_Web_Application/backend/app/emotion_detect/emotion_model'
    max_length = 512
    chunk_overlap = 50
    default_threshhold = 0.3

    tokenizer = None
    model = None
    device = None
    emotion_labels = None

    @staticmethod
    def load_model():
        if EmotionDetection.model is not None:
            return  # already loaded

        print("Loading emotion model...")
        EmotionDetection.tokenizer = DistilBertTokenizerFast.from_pretrained(EmotionDetection.model_path)
        EmotionDetection.model = DistilBertForSequenceClassification.from_pretrained(EmotionDetection.model_path)

        EmotionDetection.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        EmotionDetection.model.to(EmotionDetection.device)
        EmotionDetection.model.eval()

        EmotionDetection.emotion_labels = list(
            EmotionDetection.model.config.id2label.values()
        )

        print(f"Model loaded on {EmotionDetection.device}")

    @staticmethod
    def _predict_chunk(text):
        inputs = EmotionDetection.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=EmotionDetection.max_length,
            return_tensors="pt"
        ).to(EmotionDetection.device)

        with torch.no_grad():
            logits = EmotionDetection.model(**inputs).logits

        return torch.sigmoid(logits).squeeze().cpu().numpy()

    @staticmethod
    def _predict_with_chunking(tokens, strategy):
        chunk_size = EmotionDetection.max_length - 2
        chunks = []
        all_probabilities = []

        start = 0
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = EmotionDetection.tokenizer.decode(
                chunk_tokens, skip_special_tokens=True
            )
            chunks.append(chunk_text)

            if end >= len(tokens):
                break
            start += chunk_size - EmotionDetection.chunk_overlap

        print(f"Processing long text: {len(tokens)} tokens split into {len(chunks)} chunks")

        for chunk in chunks:
            all_probabilities.append(EmotionDetection._predict_chunk(chunk))

        all_probabilities = np.array(all_probabilities)

        if strategy == "average":
            return np.mean(all_probabilities, axis=0)
        elif strategy == "max":
            return np.max(all_probabilities, axis=0)
        else:
            raise ValueError("Invalid aggregation strategy")

    @staticmethod
    def _format_results(probabilities, threshold, top_k):
        results = []
        for i, emotion in enumerate(EmotionDetection.emotion_labels):
            prob = float(probabilities[i])
            percentage = round(prob * 100, 2)
            results.append({
                'emotion': emotion,
                'score':  percentage,
                'detected': prob >= threshold
            })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k] if top_k else results
    
    @staticmethod
    def predict(text, threshold=0.3, top_k=None, strategy="average"):
        EmotionDetection.load_model()

        tokens = EmotionDetection.tokenizer.encode(text, add_special_tokens=False)

        if len(tokens) <= EmotionDetection.max_length - 2:
            probabilities = EmotionDetection._predict_chunk(text)
        else:
            probabilities = EmotionDetection._predict_with_chunking(
                tokens, threshold, strategy
            )

        return EmotionDetection._format_results(probabilities, threshold, top_k)



