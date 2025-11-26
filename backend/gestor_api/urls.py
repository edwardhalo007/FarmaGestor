from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Certifique-se que MovimentacaoViewSet está importado
from .views import CustomAuthToken, alertas_validade, MedicamentoViewSet, UsuarioViewSet, relatorios_movimentacao, MovimentacaoViewSet, LocalidadeViewSet, dashboard_atividade, top_medicamentos

router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet) # Rota para Medicamentos (CRUD)
router.register(r'usuarios', UsuarioViewSet)       # Rota para Usuários (gerenciamento por admin)
router.register(r'movimentacoes', MovimentacaoViewSet) # <<< ADICIONE ESTA LINHA para Movimentações
router.register(r'localidades', LocalidadeViewSet)

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('alertas/validade/', alertas_validade, name='alertas_validade'),
    path('relatorios/', relatorios_movimentacao, name='relatorios_movimentacao'),
    path('movimentacoes/atividade/', dashboard_atividade, name='dashboard_atividade'),
    path('medicamentos/top/', top_medicamentos, name='top_medicamentos'),
    path('', include(router.urls)),
]