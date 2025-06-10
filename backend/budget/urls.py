from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from budget.views import (
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    FinancialSummaryViewSet,
    RegisterView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')  # Add basename
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', FinancialSummaryViewSet.as_view({'get': 'list'}), name='financial-summary'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
     path('api/', include(router.urls)),
]