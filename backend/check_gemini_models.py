import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure API key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

print("=" * 60)
print("CHECKING AVAILABLE GEMINI MODELS")
print("=" * 60)

try:
    # List all available models
    models = genai.list_models()
    
    print("\nAvailable models that support generateContent:\n")
    
    for model in models:
        # Check if the model supports generateContent
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ Model: {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Description: {model.description}")
            print(f"  Supported methods: {model.supported_generation_methods}")
            print()
    
    print("=" * 60)
    print("\nRECOMMENDED MODELS TO TRY:")
    print("=" * 60)
    
    recommended = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            # Extract just the model ID (last part after /)
            model_id = model.name.split('/')[-1]
            recommended.append(model_id)
    
    if recommended:
        print("\nUse one of these model names in your code:")
        for i, model_id in enumerate(recommended, 1):
            print(f"{i}. \"{model_id}\"")
    else:
        print("\nNo models found! Check your API key.")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. API key doesn't have access to Gemini models")
    print("3. Network connectivity issues")
    print("4. Need to enable Gemini API in Google Cloud Console")
    print("\nVerify your API key at: https://makersuite.google.com/app/apikey")