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

const submitRatings = () => {

    document.getElementById('submitButton').disabled = true;
    document.getElementById("predictedMoviesContainer2").style.visibility = "hidden"; // Hide the button
    document.getElementById("addRecsButton").style.visibility = "hidden"; // Hide the button

    const ratingsData = {};

    // Get ratings for each movie and store in ratingsData object
    movies.forEach(movieId => {
        const radios = document.getElementsByName(`movie${movieId}_rate`);
        const selectedRating = [...radios].find(radio => radio.checked);

        if (selectedRating) {
            ratingsData[`movie${movieId}`] = selectedRating.value;
        } else {
            // If no rating was selected, you might want to handle this case
            // ratingsData[`movie${movieId}`] = 'No rating';
        }
    });

    // Send ratingsData to the backend using fetch
    fetch('/submit_ratings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ratingsData)
    })
    .then(response => response.json())
    .then(data => {
        const moviesContainer = document.getElementById('predictedMoviesContainer');
        moviesContainer.innerHTML = ''; // Clear previous content

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const header2 = document.createElement('h2');
        header2.className = 'pred_title';
        header2.textContent = "Top 10 Movies";
        rank = 1;

        // Loop through the recommended movies and create HTML elements
        data.pred_movies.forEach(movie => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-2 mb-4';

            const innerDiv = document.createElement('div');
            innerDiv.className = 'text-center';


            const p1 = document.createElement('h3');
            p1.className = 'mb-0';
            p1.textContent = "Rank " + rank;

            const img = document.createElement('img');
            img.src = movie.image_url;
            img.alt = movie.title;
            img.className = 'img-fluid mb-2 pred_img';

            const p = document.createElement('p');
            p.className = 'mb-0';
            p.textContent = movie.title;

      
            innerDiv.appendChild(p1);

            innerDiv.appendChild(img);
            innerDiv.appendChild(p);
            colDiv.appendChild(innerDiv);

            rowDiv.appendChild(colDiv);
            rank++
        });
        moviesContainer.appendChild(header2)
        // Append the row of recommended movie elements to the container
        moviesContainer.appendChild(rowDiv);

        // document.getElementById("addRecsButton").style.disabled = "false"; // Hide the button
        document.getElementById("addRecsButton").style.visibility = "visible"; // Hide the button

        clearRatings();

    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors if the request fails
    });
};

const AdditionalRecs = () => {
    // Send ratingsData to the backend using fetch
    fetch('/additional_recs')
    .then(response => response.json())
    .then(data => {
        const moviesContainer_add = document.getElementById('predictedMoviesContainer2');
        moviesContainer_add.innerHTML = ''; // Clear previous content

        const rowDiv_add = document.createElement('div');
        rowDiv_add.className = 'row';

        const header2_add = document.createElement('h2');
        header2_add.className = 'pred_title';
        header2_add.textContent = "Additional Movies";
        // rank = 1;

        // Loop through the recommended movies and create HTML elements
        data.pred_add_movies.forEach(movie => {
            const colDiv_add = document.createElement('div');
            colDiv_add.className = 'col-md-2 mb-4';

            const innerDiv_add = document.createElement('div');
            innerDiv_add.className = 'text-center';

            const img_add = document.createElement('img');
            img_add.src = movie.image_url;
            img_add.alt = movie.title;
            img_add.className = 'img-fluid mb-2 pred_img';

            const p_add = document.createElement('p');
            p_add.className = 'mb-0';
            p_add.textContent = movie.title;

            innerDiv_add.appendChild(img_add);
            innerDiv_add.appendChild(p_add);
            colDiv_add.appendChild(innerDiv_add);

            rowDiv_add.appendChild(colDiv_add);
        });
        moviesContainer_add.appendChild(header2_add)
        // Append the row of recommended movie elements to the container
        moviesContainer_add.appendChild(rowDiv_add);
    document.getElementById("predictedMoviesContainer2").style.visibility = "visible"; // Hide the button
    document.getElementById('addRecsButton').style.visibility = "hidden";

    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors if the request fails
    });
};
