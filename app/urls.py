from django.urls import path
from django.conf import settings

from .views import IndexView

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
]