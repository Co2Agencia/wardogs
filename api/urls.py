from django.urls import path
from . import views
from rest_framework.authtoken.views import obtain_auth_token

app_name = "api"

urlpatterns = [

	# Usuarios
	path('usuario-list', views.usuarioList, name="usuario-list"),
	path('usuario-detail/<str:pk>', views.usuarioDetail, name="usuario-detail"),
	path('usuario-create', views.usuarioCreate, name="usuario-create"),
	path('usuario-delete/<str:pk>', views.usuarioDelete, name="usuario-delete"),
	
	# Login
	path('login', views.usuarioLogin, name="login"),
	# img Usuario
	path('img-usuario-create', views.imgUsuarioCreate, name="img-usuario-create"),
	path('img-usuario-list', views.imgUsuarioList, name="img-usuario-list"),
	path('img-usuario-delete/<str:pk>', views.imgUsuarioDelete, name="img-usuario-delete"),
	path('img-usuario-update/<str:pk>', views.imgUsuarioUpdate, name="img-usuario-update"),

	# Noticias
	path('noticia-list', views.ApiNoticiaListView.as_view(), name="noticia-list"),
	path('noticia-detail/<str:pk>', views.noticiaDetail, name="noticia-detail"),
	path('noticia-create', views.noticiaCreate, name="noticia-create"),
	path('noticia-delete/<str:pk>', views.noticiaDelete, name="noticia-delete"),
	path('noticia-update/<str:pk>', views.noticiaUpdate, name="noticia-update"),

	# Banners
	path('banner-detail/<str:sector>', views.bannerDetail, name="banner-detail"),
	path('banner-create', views.bannerCreate, name="banner-create"),
	path('banner-update/<str:sector>', views.bannerUpdate, name="banner-update"),
	path('banner-delete/<str:sector>', views.bannerDelete, name="banner-delete"),

	# Misiones
	path('mision-list', views.misionList, name="mision-list"),
	path('mision-detail/<str:pk>', views.misionDetail, name="mision-detail"),
	path('mision-create', views.misionCreate, name="mision-create"),
	path('mision-delete/<str:pk>', views.misionDelete, name="mision-delete"),
	path('mision-update/<str:pk>', views.misionUpdate, name="mision-update"),

	# Me Gusta
	path('noticia-megusta', views.meGustaCreate, name="noticia-megusta"),

	# Token
	path('token', obtain_auth_token, name="token"),


]
