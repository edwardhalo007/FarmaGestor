from django.contrib import admin
from .models import Medicamento, Usuario, Movimentacao # Importe os modelos

admin.site.register(Medicamento) # <<< Adicione/Verifique esta linha
admin.site.register(Usuario)     # <<< Adicione/Verifique esta linha
admin.site.register(Movimentacao) # <<< Adicione/Verifique esta linha