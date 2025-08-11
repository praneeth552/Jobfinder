import nltk
import spacy
import subprocess
import sys
import os

DOWNLOAD_DIR = 'layers/nlp/python'

def download_models():
    print("Checking and downloading NLP models...")
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    nltk.data.path.append(DOWNLOAD_DIR)

    try:
        nltk.data.find('tokenizers/punkt', paths=[DOWNLOAD_DIR])
        print("NLTK 'punkt' is already downloaded.")
    except LookupError:
        print("Downloading NLTK 'punkt'...")
        nltk.download('punkt', download_dir=DOWNLOAD_DIR)
        print("NLTK 'punkt' downloaded successfully.")
    
    try:
        nltk.data.find('corpora/stopwords', paths=[DOWNLOAD_DIR])
        print("NLTK 'stopwords' is already downloaded.")
    except LookupError:
        print("Downloading NLTK 'stopwords'...")
        nltk.download('stopwords', download_dir=DOWNLOAD_DIR)
        print("NLTK 'stopwords' downloaded successfully.")

    try:
        spacy.load('en_core_web_sm')
        print("spaCy 'en_core_web_sm' is already downloaded.")
    except OSError:
        print("Downloading spaCy 'en_core_web_sm'...")
        subprocess.run([sys.executable, '-m', 'spacy', 'download', 'en_core_web_sm'])
        # Move the spacy model to the layer directory
        spacy_model_path = os.path.join(os.path.dirname(spacy.__file__), 'en_core_web_sm', 'en_core_web_sm-3.7.1')
        if os.path.exists(spacy_model_path):
            os.rename(spacy_model_path, os.path.join(DOWNLOAD_DIR, 'en_core_web_sm'))
        print("spaCy 'en_core_web_sm' downloaded successfully.")

if __name__ == "__main__":
    download_models()