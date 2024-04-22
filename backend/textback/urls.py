from django.urls import path
from .views import PredictionViewSet

urlpatterns = [
    path('pred/', PredictionViewSet.as_view({'post': 'get_pred'}), name='get_predict'),
    path('pred/user/', PredictionViewSet.as_view({'post': 'pred_user'}), name='pred_by_user')
]
