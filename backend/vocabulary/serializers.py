from rest_framework import serializers
from .models import (
    Category, Word, WordList, UserProgress,
    Phrase, ListeningSentence, ReadingSentence,
    WritingExercise, Bookmark, WordLearningProgress, PhrasalVerb, PhrasalVerbCategory,
)


class CategorySerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'order', 'word_count']

    def get_word_count(self, obj):
        return obj.words.count()


class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        fields = ['id', 'phrase', 'translation', 'order']


class ListeningSentenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeningSentence
        fields = ['id', 'sentence', 'translation', 'order']


class ReadingSentenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingSentence
        fields = ['id', 'sentence', 'translation', 'order']


class WritingExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingExercise
        fields = ['id', 'chinese_sentence', 'reference_answer', 'order']


class WordSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    phrases = PhraseSerializer(many=True, read_only=True)
    listening_sentences = ListeningSentenceSerializer(many=True, read_only=True)
    reading_sentences = ReadingSentenceSerializer(many=True, read_only=True)
    writing_exercises = WritingExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = Word
        fields = [
            'id', 'word', 'phonetic', 'part_of_speech', 'definition',
            'synonym', 'example_sentence', 'category', 'category_name',
            'difficulty', 'created_at',
            'phrases', 'listening_sentences', 'reading_sentences',
            'writing_exercises',
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


class BookmarkSerializer(serializers.ModelSerializer):
    word_detail = WordSerializer(source='word', read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'word', 'word_detail', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_word(self, value):
        user = self.context['request'].user
        if Bookmark.objects.filter(user=user, word=value).exists():
            raise serializers.ValidationError("Word already bookmarked.")
        return value


class WordLearningProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordLearningProgress
        fields = ['id', 'word', 'module', 'completed', 'score', 'details', 'updated_at']
        read_only_fields = ['user', 'updated_at']


class PhrasalVerbCategorySerializer(serializers.ModelSerializer):
    phrase_count = serializers.SerializerMethodField()

    class Meta:
        model = PhrasalVerbCategory
        fields = ['id', 'name', 'slug', 'description', 'order', 'phrase_count']

    def get_phrase_count(self, obj):
        return obj.phrasal_verbs.count()


class PhrasalVerbSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)

    class Meta:
        model = PhrasalVerb
        fields = [
            'id', 'phrase', 'meaning_zh', 'category', 'category_name', 'category_slug',
            'context_en', 'target_sentence', 'context_zh', 'usage_note', 'created_at',
        ]
