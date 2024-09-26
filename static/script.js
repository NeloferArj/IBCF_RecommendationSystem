let movies = []
function fetchMovies() {
    fetch('/get_samples')
        .then(response => response.json())
        .then(data => {
            const moviesContainer = document.getElementById('movieContainer');
            moviesContainer.innerHTML = ''; // Clear previous content

            data.sample_movie.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.className = 'col-md-3 mb-2 movies'; // Adjust the column size based on your layout

                // Add the image
                const img = document.createElement('img');
                img.src = movie.image_url;
                img.alt = movie.title;
                img.className = 'img-fluid mb-2 movie_img';
                movieDiv.appendChild(img);

                // Create the movie title element
                const titleElement = document.createElement('h4');
                titleElement.className = 'movie_label';

                titleElement.textContent = movie.title;
                movieDiv.appendChild(titleElement);

                movies.push(movie.movie_id)

                // Create the star ratings
                const starDiv = document.createElement('div');
                starDiv.classList.add('rate');
                for (let i = 5; i >= 1; i--) {
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.id = `movie${movie.movie_id}_star${i}`;
                    input.name = `movie${movie.movie_id}_rate`;
                    input.value = i;
                    starDiv.appendChild(input);

                    const label = document.createElement('label');
                    label.htmlFor = `movie${movie.movie_id}_star${i}`;
                    label.title = `${movie.title}: ${i} stars`;
                    starDiv.appendChild(label);
                }
                movieDiv.appendChild(starDiv);


                moviesContainer.appendChild(movieDiv);


            });
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors if the request fails
        });
}

const clearRatings = () => {
    movies.forEach(movieId => {
        const radios = document.getElementsByName(`movie${movieId}_rate`);
        radios.forEach(radio => {
            radio.checked = false;
        });
    });

    document.getElementById('submitButton').disabled = false;
};

