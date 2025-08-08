from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Certifique-se que MovimentacaoViewSet está importado
from .views import CustomAuthToken, alertas_validade, MedicamentoViewSet, UsuarioViewSet, relatorios_movimentacao, MovimentacaoViewSet # <<< GARANTA MovimentacaoViewSet AQUI

router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet) # Rota para Medicamentos (CRUD)
router.register(r'usuarios', UsuarioViewSet)       # Rota para Usuários (gerenciamento por admin)
router.register(r'movimentacoes', MovimentacaoViewSet) # <<< ADICIONE ESTA LINHA para Movimentações

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('alertas/validade/', alertas_validade, name='alertas_validade'),
    path('relatorios/', relatorios_movimentacao, name='relatorios_movimentacao'),
    path('', include(router.urls)),
]