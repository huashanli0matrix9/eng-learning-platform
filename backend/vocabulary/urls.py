from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'words', views.WordViewSet)
router.register(r'word-lists', views.WordListViewSet)
router.register(r'progress', views.UserProgressViewSet, basename='progress')
router.register(r'bookmarks', views.BookmarkViewSet, basename='bookmark')
router.register(r'learning-progress', views.WordLearningProgressViewSet, basename='learning-progress')
router.register(r'phrasal-verbs', views.PhrasalVerbViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ai/speaking/', views.SpeakingAIView.as_view(), name='ai-speaking'),
    path('ai/writing-correction/', views.WritingAICorrectionView.as_view(), name='ai-writing-correction'),
]
