from rest_framework import serializers
from .models import DemoRequest

class DemoRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemoRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'updated_at']

class AdminDemoRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemoRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
