import nltk
import spacy
import subprocess
import sys

def download_models():
    print("Checking and downloading NLP models...")
    try:
        nltk.data.find('tokenizers/punkt')
        print("NLTK 'punkt' is already downloaded.")
    except LookupError:
        print("Downloading NLTK 'punkt'...")
        nltk.download('punkt')
        print("NLTK 'punkt' downloaded successfully.")
    
    try:
        nltk.data.find('corpora/stopwords')
        print("NLTK 'stopwords' is already downloaded.")
    except LookupError:
        print("Downloading NLTK 'stopwords'...")
        nltk.download('stopwords')
        print("NLTK 'stopwords' downloaded successfully.")

    try:
        spacy.load('en_core_web_sm')
        print("spaCy 'en_core_web_sm' is already downloaded.")
    except OSError:
        print("Downloading spaCy 'en_core_web_sm'...")
        subprocess.run([sys.executable, '-m', 'spacy', 'download', 'en_core_web_sm'])
        print("spaCy 'en_core_web_sm' downloaded successfully.")

if __name__ == "__main__":
    download_models()
