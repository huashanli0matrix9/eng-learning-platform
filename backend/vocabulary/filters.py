import django_filters
from .models import Word


class WordFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__slug')

    class Meta:
        model = Word
        fields = ['category', 'difficulty']
