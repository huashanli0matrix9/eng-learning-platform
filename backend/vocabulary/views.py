from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
import random

from .models import Category, Word, WordList, UserProgress
from .filters import WordFilter
from .serializers import (
    CategorySerializer, WordSerializer, WordListSerializer,
    WordListDetailSerializer, UserProgressSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.annotate(word_count=Count('words')).all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class WordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Word.objects.select_related('category').all()
    serializer_class = WordSerializer
    filterset_class = WordFilter
    search_fields = ['word', 'definition', 'synonym', 'example_sentence']

    @action(detail=False, methods=['get'])
    def random(self, request):
        """Get random words for daily practice."""
        count = int(request.query_params.get('count', 10))
        max_count = min(count, 50)
        total = Word.objects.count()
        if total == 0:
            return Response({'results': []})
        random_ids = random.sample(range(1, total + 1), min(max_count, total))
        words = Word.objects.filter(id__in=random_ids).select_related('category')
        serializer = self.get_serializer(words, many=True)
        return Response({'results': serializer.data})

    @action(detail=False, methods=['get'])
    def daily(self, request):
        """Get 10 random words for daily study."""
        count = int(request.query_params.get('count', 10))
        total = Word.objects.count()
        if total == 0:
            return Response({'results': []})
        random_ids = random.sample(range(1, total + 1), min(count, total))
        words = Word.objects.filter(id__in=random_ids).select_related('category')
        serializer = self.get_serializer(words, many=True)
        return Response({'results': serializer.data})


class WordListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WordList.objects.annotate(word_count=Count('words')).all()
    serializer_class = WordListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = WordListDetailSerializer(instance)
        return Response(serializer.data)


class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vocabulary learning statistics."""
        user = request.user
        total = Word.objects.count()
        studied = UserProgress.objects.filter(user=user).count()
        mastered = UserProgress.objects.filter(user=user, mastery_level=3).count()
        learning = UserProgress.objects.filter(user=user, mastery_level__in=[1, 2]).count()

        # Words due for review (next_review <= now or never reviewed)
        now = timezone.now()
        due = UserProgress.objects.filter(
            user=user, next_review__lte=now
        ).count()

        # Progress by category
        category_progress = []
        for cat in Category.objects.all():
            total_in_cat = Word.objects.filter(category=cat).count()
            if total_in_cat == 0:
                continue
            studied_in_cat = UserProgress.objects.filter(
                user=user, word__category=cat
            ).count()
            category_progress.append({
                'category': cat.name,
                'slug': cat.slug,
                'total': total_in_cat,
                'studied': studied_in_cat,
                'percentage': round(studied_in_cat / total_in_cat * 100, 1) if total_in_cat > 0 else 0,
            })

        return Response({
            'total_words': total,
            'words_studied': studied,
            'words_mastered': mastered,
            'words_learning': learning,
            'words_due_review': due,
            'overall_progress': round(studied / total * 100, 1) if total > 0 else 0,
            'category_progress': category_progress,
        })

    @action(detail=False, methods=['post'])
    def review(self, request):
        """Record a word review and update mastery."""
        word_id = request.data.get('word_id')
        correct = request.data.get('correct', True)

        if not word_id:
            return Response(
                {'error': 'word_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            word_id=word_id,
            defaults={'mastery_level': 0, 'times_reviewed': 0}
        )

        progress.times_reviewed += 1
        progress.last_reviewed = timezone.now()

        if correct:
            progress.mastery_level = min(progress.mastery_level + 1, 3)
        else:
            progress.mastery_level = max(progress.mastery_level - 1, 0)

        # Schedule next review using spaced repetition
        intervals = {0: 1, 1: 1, 2: 3, 3: 7}  # days
        from datetime import timedelta
        days = intervals.get(progress.mastery_level, 1)
        progress.next_review = timezone.now() + timedelta(days=days)
        progress.save()

        serializer = self.get_serializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def due_words(self, request):
        """Get words due for review."""
        now = timezone.now()
        progress_qs = UserProgress.objects.filter(
            user=request.user, next_review__lte=now
        ).select_related('word__category')

        page = self.paginate_queryset(progress_qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(progress_qs, many=True)
        return Response(serializer.data)
