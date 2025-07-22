from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomAuthToken, alertas_validade, MedicamentoViewSet, UsuarioViewSet, relatorios_movimentacao

# Essa porra de Router é para ViewSets (MedicamentoViewSet, UsuarioViewSet)
router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet) # Rota para Medicamentos (CRUD)
router.register(r'usuarios', UsuarioViewSet)       # Rota para Usuários (gerenciamento por admin)

urlpatterns = [
    # Endpoint de Login (POST para /api/login/)
    path('login/', CustomAuthToken.as_view(), name='api_login'),

    # Endpoint de Alertas de Validade (GET para /api/alertas/validade/)
    path('alertas/validade/', alertas_validade, name='alertas_validade'),

    # Endpoint de Relatórios (GET para /api/relatorios/)
    path('relatorios/', relatorios_movimentacao, name='relatorios_movimentacao'),

    # Inclui as URLs geradas automaticamente pelo Router para os ViewSets
    path('', include(router.urls)),
]