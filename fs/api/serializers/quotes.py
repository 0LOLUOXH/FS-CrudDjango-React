from rest_framework import serializers
from fs.models import Quote, QuoteDetail

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = '__all__'

class QuoteDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteDetail
        fields = '__all__'
