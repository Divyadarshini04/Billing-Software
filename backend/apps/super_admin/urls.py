from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserManagementViewSet,
    SystemSettingsViewSet,
    ActivityLogViewSet,
    UnitViewSet,
    SettingsAPIView,
    DataStatsView,
    BackupView,
    CleanupView,
    SystemNotificationViewSet,
)
from .dashboard_views import DashboardStatsView, GlobalReportsView
from .reports import ReportsView

router = DefaultRouter()
router.register(r"users", UserManagementViewSet, basename="user-management")
router.register(r"settings", SystemSettingsViewSet, basename="system-settings")
router.register(r"logs", ActivityLogViewSet, basename="activity-logs")
router.register(r"units", UnitViewSet, basename="units")
router.register(r"notifications", SystemNotificationViewSet, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
    path("settings-api/", SettingsAPIView.as_view(), name="settings-api"),
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("reports/", ReportsView.as_view(), name="reports"),
    path("data-stats/", DataStatsView.as_view(), name="data-stats"),
    path("backup/", BackupView.as_view(), name="backup"),
    path("cleanup/", CleanupView.as_view(), name="cleanup"),
]

