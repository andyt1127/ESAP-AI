# Required installations:
# pip install streamlit ultralytics torch torchvision openai pillow

import streamlit as st
from PIL import Image
import openai
import os
import tempfile

# --- STEP 0.5: GPT-4 Recipe Generation ---
openai.api_key = os.getenv("OPEN_AI_KEY")

# --- STEP 1: OpenAI Vision for Ingredient Detection ---
import base64

def get_ingredients_with_openai(image_path):
    """
    Uses OpenAI Vision API (GPT-4o or GPT-4-vision-preview) to detect ingredients in an image.
    Returns a list of detected ingredient names.
    """
    with open(image_path, "rb") as img_file:
        img_bytes = img_file.read()
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = (
        "You are a chef AI. List any visible food ingredient in this image. "
        "Return only a comma-separated list of ingredient names, no extra text."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
            ]}
        ],
        max_tokens=100
    )
    content = response.choices[0].message.content
    # Parse comma-separated list
    ingredients = [i.strip() for i in content.split(",") if i.strip()]
    return ingredients

# --- STEP 2: Get Ingredients using OpenAI Vision ---
def get_ingredients(image_path):
    return get_ingredients_with_openai(image_path)

def generate_recipe(ingredients):
    prompt = f"""
    You are a chef AI. Create a unique, tasty recipe using the following ingredients:
    {', '.join(ingredients)}
    Include:
    - Dish name
    - Ingredients list (quantities optional)
    - Step-by-step instructions
    - Optional: prep/cook time
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# --- STREAMLIT APP ---
st.set_page_config(page_title="AI Recipe Generator", layout="centered")
st.title("🍽️ AI Recipe Generator")
st.write("Upload an image of your ingredients. We'll detect them and create a recipe!")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
        tmp_file.write(uploaded_file.read())
        tmp_path = tmp_file.name

    st.image(tmp_path, caption='Uploaded Image', use_column_width=True)

    with st.spinner("Detecting ingredients and generating recipe..."):
        ingredients = get_ingredients(tmp_path)
        recipe = generate_recipe(ingredients)

    st.subheader("Detected Ingredients")
    st.write(", ".join(ingredients))

    st.subheader("Generated Recipe")
    st.text_area("Recipe", recipe, height=400)

    os.remove(tmp_path)
