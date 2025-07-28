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
            # Operacional, Gestor e Administrador podem modificar
            self.permission_classes = [IsAuthenticated, (lambda: self.request.user.nivel_acesso in [NivelAcesso.OPERACIONAL, NivelAcesso.GESTOR, NivelAcesso.ADMINISTRADOR])]
        elif self.action in ['list', 'retrieve']:
            # Todos autenticados podem visualizar
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

# ViewSet para Movimentações
class MovimentacaoViewSet(viewsets.ModelViewSet):
    queryset = Movimentacao.objects.all().order_by('-data')
    serializer_class = MovimentacaoSerializer
    permission_classes = [IsAuthenticated] # Permissão padrão que será refinada pelo get_permissions

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
        # Ações de CRIAÇÃO, LISTAGEM e VISUALIZAÇÃO de movimentações:
        # Permitido para usuários Operacionais, GESTORES e Administradores.
        if self.action in ['create', 'list', 'retrieve']:
            self.permission_classes = [
                IsAuthenticated,
                # Verifica se o usuário autenticado tem nível Operacional, GESTOR ou Administrador
                (lambda: self.request.user.nivel_acesso in [NivelAcesso.OPERACIONAL, NivelAcesso.GESTOR, NivelAcesso.ADMINISTRADOR])
            ]
        # Ações de ATUALIZAÇÃO e EXCLUSÃO de movimentações:
        # Permitido APENAS para Administradores.
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
            # Ou uma lambda mais explícita: (lambda: self.request.user.nivel_acesso == NivelAcesso.ADMINISTRADOR)
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

    def get_permissions(self):
        # Permissão para criar usuários: Administrador ou Gestor
        if self.action == 'create':
            self.permission_classes = [IsAuthenticated, (lambda: self.request.user.nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR])]
        # Permissão para listar/ver detalhes: Administrador ou Gestor
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated, (lambda: self.request.user.nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR])]
        # Permissão para atualizar/deletar: Apenas Administrador
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        # Lógica para impedir que Gestor crie Admin/Gestor
        request_user_nivel = self.request.user.nivel_acesso
        target_nivel_acesso = serializer.validated_data.get('nivel_acesso')

        if request_user_nivel == NivelAcesso.GESTOR:
            if target_nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR]:
                raise serializers.ValidationError({"detail": "Gestores não podem criar usuários com nível de Administrador ou Gestor."})
        serializer.save()

    def perform_update(self, serializer):
        # Lógica para impedir que Gestor modifique Admin/Gestor ou seu próprio nível
        request_user_nivel = self.request.user.nivel_acesso
        target_user = self.get_object()
        new_target_nivel_acesso = serializer.validated_data.get('nivel_acesso', target_user.nivel_acesso)

        if request_user_nivel == NivelAcesso.GESTOR:
            if target_user.nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR] and target_user.pk != self.request.user.pk:
                raise serializers.ValidationError({"detail": "Gestores não podem modificar usuários Administradores ou outros Gestores."})
            if target_user.pk == self.request.user.pk and new_target_nivel_acesso != request_user_nivel:
                raise serializers.ValidationError({"detail": "Gestores não podem modificar o próprio nível de acesso."})
            if new_target_nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR] and target_user.pk != self.request.user.pk:
                raise serializers.ValidationError({"detail": "Gestores não podem atribuir níveis de Administrador ou Gestor."})

        serializer.save()




