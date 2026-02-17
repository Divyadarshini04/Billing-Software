from django.urls import path
from .views import SubmitDemoRequestView, LeadListView, LeadDetailView

urlpatterns = [
    path('submit/', SubmitDemoRequestView.as_view(), name='submit-demo-request'),
    path('admin/list/', LeadListView.as_view(), name='admin-lead-list'),
    path('admin/<int:pk>/', LeadDetailView.as_view(), name='admin-lead-detail'),
]
