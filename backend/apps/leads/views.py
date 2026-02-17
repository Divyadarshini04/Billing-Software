from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import DemoRequest
from .serializers import DemoRequestSerializer, AdminDemoRequestSerializer

class SubmitDemoRequestView(generics.CreateAPIView):
    """
    Public endpoint for submitting demo requests.
    """
    queryset = DemoRequest.objects.all()
    serializer_class = DemoRequestSerializer
    permission_classes = [permissions.AllowAny]

class LeadListView(generics.ListAPIView):
    """
    Admin endpoint to list all leads.
    """
    queryset = DemoRequest.objects.all()
    serializer_class = AdminDemoRequestSerializer
    permission_classes = [permissions.IsAdminUser]

class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin endpoint to manage a specific lead.
    """
    queryset = DemoRequest.objects.all()
    serializer_class = AdminDemoRequestSerializer
    permission_classes = [permissions.IsAdminUser]
