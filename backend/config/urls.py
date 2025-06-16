from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from budget.views import health_check
from budget.views import (
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    FinancialSummaryViewSet,
    RegisterView,
)

# 1. Setup the router in your main config/urls.py
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')

# 2. Define all your URL patterns here
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # All API routes from the router will be prefixed with /api/
    path('api/', include(router.urls)),
    
    # Specific API routes
    path('api/summary/', FinancialSummaryViewSet.as_view({'get': 'list'}), name='financial-summary'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', obtain_auth_token, name='api-token-auth'), 
    path('health/', health_check),
]
