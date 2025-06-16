from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import UserRegisterSerializer
from .models import Category
from django.http import JsonResponse
DEFAULT_CATEGORIES = [
    {"name": "Salary", "category_type": "IN"},
    {"name": "Bonus", "category_type": "IN"},
    {"name": "Freelance", "category_type": "IN"},
    {"name": "Other Income", "category_type": "IN"},
    {"name": "Groceries", "category_type": "EX"},
    {"name": "Rent", "category_type": "EX"},
    {"name": "Utilities", "category_type": "EX"},
    {"name": "Transportation", "category_type": "EX"},
    {"name": "Entertainment", "category_type": "EX"},
    {"name": "Dining Out", "category_type": "EX"},
    {"name": "Shopping", "category_type": "EX"},
    {"name": "Healthcare", "category_type": "EX"},
    {"name": "Subscriptions", "category_type": "EX"},
    {"name": "Education", "category_type": "EX"},
    {"name": "Travel", "category_type": "EX"},
    {"name": "Insurance", "category_type": "EX"},
]
def health_check(request):
    return JsonResponse({"status": "ok"})
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # 🔥 Create default categories for the user
        for cat in DEFAULT_CATEGORIES:
            Category.objects.create(user=user, name=cat["name"], category_type=cat["category_type"])

        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        return serializer.save()
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        category_name = self.request.query_params.get('category')
        amount = self.request.query_params.get('amount') # Added amount filter
        
        if start_date and end_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__range=[start_date_obj, end_date_obj])
            except ValueError:
                # Silently ignore invalid date formats
                pass

        # FIX: Changed filter from 'category_name' to 'category__name' to correctly query the related model.
        if category_name:
            queryset = queryset.filter(category__name=category_name)

        # FIX: Added filtering by amount.
        if amount:
            try:
                queryset = queryset.filter(amount=amount)
            except ValueError:
                # Silently ignore invalid amount values
                pass
            
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        category_id = self.request.data.get('category_id')
        if not category_id:
            raise ValidationError({"category_id": "This field is required."})

        try:
            category = Category.objects.get(pk=category_id, user=self.request.user)
        except Category.DoesNotExist:
            raise ValidationError({"category_id": "Invalid category ID for this user."})

        serializer.save(user=self.request.user, category=category)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure the category belongs to the user.
        category = Category.objects.get(pk=self.request.data.get('category_id'))
        if category.user != self.request.user:
            return Response({'error': 'Invalid category'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=self.request.user)
from datetime import timedelta

class FinancialSummaryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        today = timezone.now().date()
        first_day_of_month = today.replace(day=1)
        next_month = (first_day_of_month.replace(day=28) + timedelta(days=4)).replace(day=1)
        last_day_of_month = next_month - timedelta(days=1)

        income_categories = Category.objects.filter(user=request.user, category_type='IN')
        expense_categories = Category.objects.filter(user=request.user, category_type='EX')

        total_income = Transaction.objects.filter(
            user=request.user,
            category__in=income_categories,
            date__range=[first_day_of_month, last_day_of_month]
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_expenses = Transaction.objects.filter(
            user=request.user,
            category__in=expense_categories,
            date__range=[first_day_of_month, last_day_of_month]
        ).aggregate(total=Sum('amount'))['total'] or 0

        budgets = Budget.objects.filter(
            user=request.user,
            month__month=first_day_of_month.month,
            month__year=first_day_of_month.year
        )

        budget_data = []
        for budget in budgets:
            actual = Transaction.objects.filter(
                user=request.user,
                category=budget.category,
                date__range=[first_day_of_month, last_day_of_month]
            ).aggregate(total=Sum('amount'))['total'] or 0
            budget_data.append({
                'category': budget.category.name,
                'budget': float(budget.amount),
                'actual': float(actual),
            })

        return Response({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'balance': float(total_income) - float(total_expenses),
            'budget_vs_actual': budget_data
        })
