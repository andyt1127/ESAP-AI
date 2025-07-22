document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const analyzeButton = document.getElementById("analyzeButton");
    const preview = document.getElementById("preview");
    const results = document.getElementById("results");
    const loading = document.getElementById("loading");

    // Hide loading spinner initially
    loading.classList.add("hidden");

    // Preview the uploaded image
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; border-radius: 8px;" />`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = "";
        }
    });

    // Simulate analysis process
    analyzeButton.addEventListener("click", () => {
        if (!imageInput.files.length) {
            alert("Please upload an image first.");
            return;
        }

        // Show loading spinner
        loading.classList.remove("hidden");
        results.innerHTML = "";

        // Simulate a delay for analysis
        setTimeout(() => {
            loading.classList.add("hidden");
            results.innerHTML = "<p>Analysis complete! Detected ingredients: Milk, Eggs, Butter.</p>";
        }, 3000); // Simulate 3 seconds of analysis
    });
});