from rest_framework import status
from rest_framework import viewsets
import pandas as pd
from rest_framework.response import Response
import pickle
import os
import dill
from ntscraper import Nitter

Scraper = Nitter()
# Create your views here.
base_dir = "textback"
models_folder = "models"
model_path = "model.pkl"
csv_path = "result.csv"
vectorizer_path = "vectorizer.pkl"
clean_path = "clean_function.pkl"
visualization_path = "visualization.pkl"

model_join = os.path.join(base_dir, models_folder, model_path)
vectorizer_join = os.path.join(base_dir, models_folder, vectorizer_path)
clean_join = os.path.join(base_dir, models_folder, clean_path)
result_csv = os.path.join (base_dir, models_folder, csv_path)
visualization_join = os.path.join(base_dir, models_folder, visualization_path)

model = pickle.load(open(model_join, "rb"))
cv = pickle.load(open(vectorizer_join, "rb"))
clean = dill.load(open(clean_join, "rb"))
visualization = dill.load(open(visualization_join, "rb"))

def predict(input):
    input = cv.transform([input]).toarray()
    predict = model.predict(input)[0]
    return predict

def Scrap(input):
    tweets = Scraper.get_tweets(input, mode='user', number=1000)

    final_tweets = []

    for tweet in tweets['tweets']:
        data = [tweet['text'],tweet['date']]
        final_tweets.append(data)

    tweets_cleaned = []
    no_hate_offen = 0
    hate = 0
    offensive = 0

    for i in range(len(final_tweets)):
        clean_tweets = clean(final_tweets[i])
        if clean_tweets != "":
            tweets_cleaned.append(clean_tweets)

    for i in range(len(tweets_cleaned)):
        prediction = predict(tweets_cleaned[i])
        if prediction == "No hate and offensive speech":
            no_hate_offen += 1
        elif prediction == "Hate speech Detected":
            hate += 1
        else :
            offensive += 1

    # Save new data to csv to visualization
    data = pd.DataFrame(final_tweets, columns=['text','date'])
    data['date'] = pd.to_datetime(data['date'], format='%b %d, %Y · %I:%M %p %Z')
    data['date'] = data['date'].dt.to_period('M')
    data['score'] = data['text'].apply(predict)
    data['score'] = data['score'].replace({'No hate and offensive speech':0,'Offensive language detected':1,'Hate speech Detected':2})
    data['Month'] = data['date'].dt.month
    data.to_csv(result_csv, index=False)

    return no_hate_offen, offensive, hate

class PredictionViewSet(viewsets.ViewSet):
    def get_pred (self, request):
        try:
            input = request.data.get('input')
            prediction = predict(input)
            response_data = {
                "success" : 1,
                "From" : input,
                "Result": prediction
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success" : 0,
                "error": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def pred_user (self, request):
        try:
            input = request.data.get('username')
            result = Scrap(input)
            image_base64 = visualization()
            response_data = {
                "success": 1,
                "From" : input,
                "no_hate_offen" : result[0],
                "offensive" : result[1],
                "hate" : result[2],
                "image_base64": image_base64
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success" : 0,
                "error": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)