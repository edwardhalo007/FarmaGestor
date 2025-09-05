# FarmaGestor/backend/gestor_api/serializers.py

from rest_framework import serializers
from .models import Medicamento, Usuario, Movimentacao, Localidade
from django.core.exceptions import ValidationError as DjangoValidationError

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nivel_acesso', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True},
        }

    def validate_email(self, value):
        """
        Valida que o email seja único, ignorando o próprio objeto em caso de atualização.
        """
        # Verifica se já existe algum usuário com o mesmo email
        queryset = Usuario.objects.filter(email=value)

        # Se estamos atualizando um objeto, excluímos o próprio objeto da verificação
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        # Se a queryset ainda tiver resultados, o email já está em uso
        if queryset.exists():
            raise serializers.ValidationError("Este email já está em uso.")
            
        return value

    def create(self, validated_data):
        """
        Cria e retorna um novo 'Usuario', com a senha criptografada.
        """
        # A validação de senha do Django é executada aqui
        user = Usuario.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        """
        Atualiza e retorna um 'Usuario' existente.
        """
        # Atualiza a senha separadamente, se ela for fornecida
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        
        # Atualiza o restante dos campos e salva
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        fields = '__all__'

class MedicamentoSerializer(serializers.ModelSerializer):
    localizacao_detalhe = LocalidadeSerializer(source='localizacao', read_only=True)

    class Meta:
        model = Medicamento
        fields = [
            'id',
            'nome',
            'dosagem',
            'forma_farmaceutica',
            'unidade_medida',
            'validade',
            'vencimento_validade',
            'quantidade',
            'lote',
            'fabricante',
            'localizacao',
            'localizacao_detalhe' 
        ]
        extra_kwargs = {'localizacao': {'write_only': True}}

class MovimentacaoSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.ReadOnlyField(source='medicamento.nome')
    responsavel_username = serializers.ReadOnlyField(source='responsavel.username')

    class Meta:
        model = Movimentacao
        fields = '__all__'