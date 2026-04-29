from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'words', views.WordViewSet)
router.register(r'word-lists', views.WordListViewSet)
router.register(r'progress', views.UserProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
]
