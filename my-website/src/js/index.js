document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recipe-form');
    const imageInput = document.getElementById('ingredient-image');
    const ingredientsResult = document.getElementById('ingredients-result');
    const recipeResult = document.getElementById('recipe-result');
    const feedback = document.getElementById('feedback');
    const imagePreview = document.getElementById('image-preview');

    imageInput.addEventListener('change', function() {
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        ingredientsResult.textContent = '';
        recipeResult.textContent = '';
        feedback.textContent = '';

        if (!imageInput.files.length) {
            feedback.textContent = 'Please select an image.';
            return;
        }

        // 1. Send image to backend for ingredient detection
        const formData = new FormData();
        formData.append('file', imageInput.files[0]);
        ingredientsResult.textContent = 'Detecting ingredients...';
        recipeResult.textContent = '';
        feedback.textContent = '';
        let ingredients = [];
        try {
            const response = await fetch('http://localhost:8000/detect-ingredients', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error detecting ingredients.');
            }
            ingredients = data.ingredients || [];
            if (ingredients.length === 0) {
                ingredientsResult.textContent = 'No ingredients detected.';
                return;
            }
            ingredientsResult.textContent = 'Detected Ingredients: ' + ingredients.join(', ');
        } catch (err) {
            ingredientsResult.textContent = '';
            feedback.textContent = err.message || 'Error detecting ingredients.';
            return;
        }

        // 2. Send ingredients to backend for recipe generation
        recipeResult.textContent = 'Generating recipe...';
        feedback.textContent = '';
        try {
            const params = new URLSearchParams();
            params.append('ingredients', ingredients.join(','));
            const response = await fetch('http://localhost:8000/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            const data = await response.json();
            if (data.recipe) {
                recipeResult.textContent = data.recipe;
            } else if (data.error) {
                feedback.textContent = data.error;
                recipeResult.textContent = '';
            } else {
                recipeResult.textContent = 'No recipe generated.';
            }
        } catch (err) {
            recipeResult.textContent = '';
            feedback.textContent = err.message || 'Error generating recipe.';
        }
    });
});