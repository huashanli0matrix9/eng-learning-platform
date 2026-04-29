from rest_framework import serializers
from .models import Category, Word, WordList, UserProgress


class CategorySerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'order', 'word_count']

    def get_word_count(self, obj):
        return obj.words.count()


class WordSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Word
        fields = [
            'id', 'word', 'phonetic', 'part_of_speech', 'definition',
            'synonym', 'example_sentence', 'category', 'category_name',
            'difficulty', 'created_at',
        ]


class WordListSerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()

    class Meta:
        model = WordList
        fields = ['id', 'name', 'description', 'word_count', 'created_at']

    def get_word_count(self, obj):
        return obj.words.count()


class WordListDetailSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True, read_only=True)

    class Meta:
        model = WordList
        fields = ['id', 'name', 'description', 'words', 'created_at']


class UserProgressSerializer(serializers.ModelSerializer):
    word_detail = WordSerializer(source='word', read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 'word', 'word_detail', 'mastery_level',
            'times_reviewed', 'last_reviewed', 'next_review',
        ]
        read_only_fields = ['user', 'times_reviewed', 'last_reviewed']
