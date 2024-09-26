from flask import Flask, render_template, request
import pandas as pd
import requests
from flask import jsonify
import numpy as np
import math
import re

app = Flask(__name__)

# load data
data = pd.read_csv("data.csv")
movie_samples = pd.read_csv("movie_sample.csv", header=0, dtype=str)
R = pd.read_csv("ratings.csv", header=0, dtype=str)
R = R.apply(pd.to_numeric, errors='coerce')
s1_recs = pd.read_csv('system_1_recommendations.csv')

@app.route('/')
def index():
    return render_template('index.html',show_div=False,show_sample=False,show_pred=False)

# method to get the top 20 movies based on the most popular movies excluding the one rated by the user
# logic for creating popular_movies_df in listed in the HTML report 
def get_addtional_movies_IBCF(ratings_data):
    movie_ids = []

    popular_movies = pd.read_csv("popular_movies_df.csv")
    return additional_recs

# myIBCF takes movies rated by the user and generates predictions
def myIBCF(ratings_data):
    w = np.full(3706, np.nan)  # Create an array of NaNs of length 3706
    for movie_id, rating in ratings_data.items():
        index = int(movie_id.replace('movie', ''))  # Extract the index from movie_id
        w[index] = int(rating)    # Set the rating at the respective index
        
    #Test user 1 
    # w = R.loc['u1181']
    # w = w.to_numpy()
    
    # # #Test user 2
    # w = R.loc['u1351']
    # w = w.to_numpy()

    #Load similarity matrix
    S = pd.read_csv("modified_similarity_matrix.csv")
    S = pd.DataFrame(S)
    non_nan_count = sum(1 for pred in preds if not math.isnan(pred))
    # non_nan_count = 10

    # if there are greater than 30 nonNAN preditions then we get top 10 predtions as well as additional predictions
    if non_nan_count >= 30:
      movie_indices = preds.argsort()[-30:][::-1]  # Select the indices of the top 30 predictions

      # Store the first 10 predictions in an array called 'recs'
      recs = movie_indices[:10]

      # Store the next 20 predictions in an array called 'add_recs'
      add_recs = movie_indices[10:30]

      # Assuming add_recs contains indices or movie titles and R is your DataFrame
      add_recs_movies = R.columns[add_recs]  # Assuming add_recs contains indices or movie titles

      # Create a DataFrame for the add_recs movies
      add_recs_df = pd.DataFrame({'movie_id': add_recs_movies})

      # Save the DataFrame to a CSV file
      add_recs_df.to_csv('add_recs_movies.csv', index=False)
          
    #   for i in recs:
    #       print(f'{R.columns[i]}: {preds[i]}')
      return_val =  R.columns[recs]

    # if there are less than 30 nonNAN preditons but there are greater or equal to 10 nonNAN preditions then we only get top 10 predtions, the additional movies will be set to the most popular movies
    elif non_nan_count>=10:
      movie_indices = preds.argsort()[-10:][::-1]  # Select the indices of the top 10 predictions

    #   for i in movie_indices:
    #     print(f'{R.columns[i]}: {preds[i]}')
        
      get_addtional_movies_IBCF(ratings_data) # Sets additional movies based on most popular movies

      return_val =  R.columns[movie_indices]

    # if there are less than 10 nonNAN preditons, we set the top 10 movies and the additional movies to the most most popular movies
    else:
      return_val = []  # Less than 10 valid predictions    

    return return_val  # Return the column names of the top predicted movies

# method is called when loading system 2 
# logic for creating movie_samples in listed in the HTML report 
@app.route('/get_samples')
def get_samples():
    dict_list = movie_samples.to_dict(orient='records')
    return jsonify(sample_movie=dict_list)

# method is called in system 1 to recommed movie based on a genre
# logic for creating s1_recs in listed in the HTML report 
@app.route('/recommend',methods=['GET'])
def recommend():
    if request.method == 'GET':
        selected_genre = request.args.get('genre')  # Retrieve the selected genre from the URL parameters

        #read in df that contains popular movies and filter by genre
        top_5_movies = s1_recs[s1_recs['genre'].str.contains(selected_genre, case=False)]
        dict_list_recs = top_5_movies.to_dict(orient='records')

    return render_template('index.html', top_movies=dict_list_recs, show_div=True, genre=selected_genre)

# method is called when user clicks additional movies button
# logic for creating add_recs_movies in listed in the HTML report 
@app.route('/additional_recs', methods=['get'])
def additional_recs():
    #read in addition recomendations
    add_recs_df = pd.read_csv('add_recs_movies.csv')
    add_recs_df['movie_id'] = add_recs_df['movie_id'].str.replace('m', '')  # Remove 'm' from 'movie_id'
    add_recs_df['movie_id'] = add_recs_df['movie_id'].astype(int)  # Convert 'movie_id' to integers

    # get title and movie poster for the additonal recommendations
    merged_data = pd.merge(data, add_recs_df, how='inner', on='movie_id')

    dict_list = merged_data.to_dict(orient='records')

    return jsonify({'pred_add_movies': dict_list})

# method to get the most popular movies using review count and ratings and excluding the one rated by the user
# logic for creating popular_movies_df in listed in the HTML report 
def get_most_popular_movies(ratings_data):
    movie_ids = []

    popular_movies = pd.read_csv("popular_movies_df.csv")
    
    # Filter out movie IDs from popular_movies DataFrame
    popular_movies_excluded = popular_movies[~popular_movies['movie_id'].isin(movie_ids)]
    
    top_10 = popular_movies_excluded[:10]
    dict_list = top_10.to_dict(orient='records')
    
    # Select the next 20 records from popular_movies_excluded, this will be used as the addication reccomendations
    additional_recs = popular_movies_excluded.iloc[10:30]

    # Extract the 'movie_id' column and convert it to strings with 'm' prefix
    additional_recs = additional_recs[['movie_id']]
    additional_recs['movie_id'] = 'm' + additional_recs['movie_id'].astype(str)

    additional_recs.to_csv('add_recs_movies.csv', index=False)

    return dict_list


# called when user clicks the submit ratings button
@app.route('/submit_ratings', methods=['POST'])
def submit_ratings():
    # get ratings submitted by user
    ratings_data = request.json
        
    # take IBCF predictions and get movie titles and posters
    dict_list = get_pred_movies(preds)

    return jsonify({'pred_movies': dict_list})


if __name__ == '__main__':
    app.run(debug=True)
