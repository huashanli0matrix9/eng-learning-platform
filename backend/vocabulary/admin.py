from django.contrib import admin
from .models import Category, Word, WordList, UserProgress


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ['name', 'order', 'word_count']
    search_fields = ['name']

    def get_queryset(self, request):
        from django.db.models import Count
        return super().get_queryset(request).annotate(word_count=Count('words'))

    def word_count(self, obj):
        return obj.word_count
    word_count.admin_order_field = 'word_count'


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['word', 'part_of_speech', 'difficulty', 'category', 'created_at']
    list_filter = ['difficulty', 'category', 'part_of_speech']
    search_fields = ['word', 'definition']
    list_per_page = 50


@admin.register(WordList)
class WordListAdmin(admin.ModelAdmin):
    filter_horizontal = ['words']
    list_display = ['name', 'word_count', 'created_at']
    search_fields = ['name']

    def word_count(self, obj):
        return obj.words.count()


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'mastery_level', 'times_reviewed', 'next_review']
    list_filter = ['mastery_level']
    search_fields = ['user__username', 'word__word']
