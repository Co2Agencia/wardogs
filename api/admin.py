from django.contrib import admin
from .models import Noticia, Banner, Usuario
from django.contrib.auth.admin import UserAdmin

# Register your models here.

class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('id','titulo','usuario', 'fecha')

class BannerAdmin(admin.ModelAdmin):
    list_display = ('id','sector','fecha')

class UsuarioAdmin(UserAdmin):
    pass


admin.site.register(Noticia, NoticiaAdmin)
admin.site.register(Banner, BannerAdmin)
admin.site.register(Usuario, UsuarioAdmin)