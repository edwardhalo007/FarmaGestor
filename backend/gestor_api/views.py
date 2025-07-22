# FarmaGestor/backend/gestor_api/views.py

from datetime import date, timedelta
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser # Inclua IsAdminUser
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from .models import Medicamento, Usuario, Movimentacao, NivelAcesso # Importe todos os seus modelos
from .serializers import MedicamentoSerializer, UsuarioSerializer, MovimentacaoSerializer # Importe todos os seus serializers
from django.db import IntegrityError # Importe IntegrityError para lidar com erros de criação de usuário se necessário

# View para Login (endpoint /api/login/)
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'nivel_acesso': user.nivel_acesso
        })

# ViewSets para CRUD de Medicamentos
class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, (lambda: IsAuthenticated() and (self.request.user.nivel_acesso in [NivelAcesso.OPERACIONAL, NivelAcesso.ADMINISTRADOR]))]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

# ViewSet para Movimentações
class MovimentacaoViewSet(viewsets.ModelViewSet):
    queryset = Movimentacao.objects.all().order_by('-data')
    serializer_class = MovimentacaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(responsavel=self.request.user)

        medicamento = serializer.validated_data['medicamento']
        quantidade_movimentada = serializer.validated_data['quantidade']
        tipo_movimentacao = serializer.validated_data['tipo']

        if tipo_movimentacao == 'ENTRADA':
            medicamento.quantidade += quantidade_movimentada
        elif tipo_movimentacao == 'SAIDA':
            if medicamento.quantidade < quantidade_movimentada:
                raise serializers.ValidationError("Quantidade em estoque insuficiente.")
            medicamento.quantidade -= quantidade_movimentada
        medicamento.save()

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            self.permission_classes = [IsAuthenticated, (lambda: IsAuthenticated() and (self.request.user.nivel_acesso in [NivelAcesso.OPERACIONAL, NivelAcesso.ADMINISTRADOR]))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in self.permission_classes]


# Views para Alertas de Validade (Seu Módulo)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertas_validade(request):
    data_hoje = date.today()
    data_limite = data_hoje + timedelta(days=30)
    medicamentos_proximos = Medicamento.objects.filter(
        validade__lte=data_limite,
        validade__gte=data_hoje
    ).order_by('validade')
    serializer = MedicamentoSerializer(medicamentos_proximos, many=True)
    return Response(serializer.data)

# Views para Relatórios
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorios_movimentacao(request):
    medicamento_id = request.query_params.get('medicamento_id')
    data_inicio = request.query_params.get('data_inicio')
    data_fim = request.query_params.get('data_fim')

    movimentacoes = Movimentacao.objects.all()

    if medicamento_id:
        movimentacoes = movimentacoes.filter(medicamento__id=medicamento_id)
    if data_inicio:
        movimentacoes = movimentacoes.filter(data__gte=data_inicio)
    if data_fim:
        movimentacoes = movimentacoes.filter(data__lte=data_fim)

    serializer = MovimentacaoSerializer(movimentacoes.order_by('data'), many=True)
    return Response(serializer.data)

# View para gerenciamento de usuários (apenas para Administrador)
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser] # Apenas administradores


