from rest_framework import status
from rest_framework import viewsets
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
vectorizer_path = "vectorizer.pkl"
clean_path = "clean_function.pkl"

model_join = os.path.join(base_dir, models_folder, model_path)
vectorizer_join = os.path.join(base_dir, models_folder, vectorizer_path)
clean_join = os.path.join(base_dir, models_folder, clean_path)

model = pickle.load(open(model_join, "rb"))
cv = pickle.load(open(vectorizer_join, "rb"))
clean = dill.load(open(clean_join, "rb"))

def predict(input):
    input = cv.transform([input]).toarray()
    predict = model.predict(input)[0]
    return predict

def Scrap(input):
    tweets = Scraper.get_tweets(input, mode='user', number=100)
    final_tweets = []
    for tweet in tweets['tweets']:
        data = [tweet['text']]
        final_tweets.append(data)
    tweets_cleaned = []
    Negative = 0
    Neutral = 0
    for i in range(len(final_tweets)):
        clean_tweets = clean(final_tweets[i])
        if clean_tweets != "":
            tweets_cleaned.append(clean_tweets)
    for i in range(len(tweets_cleaned)):
        prediction = predict(tweets_cleaned[i])
        if prediction == "No hate and offensive speech":
            Neutral += 1
        else :
            Negative += 1
    return Negative, Neutral

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
            response_data = {
                "success": 1,
                "From" : input,
                "Negative Score" : result[0],
                "Neutral Score" : result[1]
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success" : 0,
                "error": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)