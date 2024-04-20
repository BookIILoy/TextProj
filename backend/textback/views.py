from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
import pickle
import os

# Create your views here.
base_dir = "textback"
models_folder = "models"
model_path = "model.pkl"
vectorizer_path = "vectorizer.pkl"

model_join = os.path.join(base_dir, models_folder, model_path)
vectorizer_join = os.path.join(base_dir, models_folder, vectorizer_path)

model = pickle.load(open(model_join, "rb"))
cv = pickle.load(open(vectorizer_join, "rb"))

def predict(input):
    input = cv.transform([input]).toarray()
    predict = model.predict(input)[0]
    return predict

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