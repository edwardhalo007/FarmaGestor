from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomAuthToken, alertas_validade, MedicamentoViewSet, UsuarioViewSet, relatorios_movimentacao, MovimentacaoViewSet, LocalidadeViewSet, dashboard_atividade, top_medicamentos

router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet)
router.register(r'usuarios', UsuarioViewSet)    
router.register(r'movimentacoes', MovimentacaoViewSet, basename='movimentacao') 
router.register(r'localidades', LocalidadeViewSet)

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('alertas/validade/', alertas_validade, name='alertas_validade'),
    path('relatorios/', relatorios_movimentacao, name='relatorios_movimentacao'),
    path('movimentacoes/atividade/', dashboard_atividade, name='dashboard_atividade'),
    path('medicamentos/top/', top_medicamentos, name='top_medicamentos'),
    path('', include(router.urls)),
]