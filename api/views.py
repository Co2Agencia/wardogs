from functools import partial

from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from rest_framework import status

# Tokens
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import serializers
# Models
from .models import Banner, Mision, Noticia, Usuario, imgUsuario, meGusta
# Serializers
from .serializers import (BannerSerializer, CrearNoticiaSerializer,ImgUsuarioSerializer, MeGustaSerializer,
NoticiaSerializer, UsuarioSerializer, MisionSerializer)

from .utils import PaginationClass


# try:
# 	for user in Usuario.objects.all():
# 		Token.objects.get_or_create(user=user)
# except:
# 	pass



""" Tokens """
class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['Usuario']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        }, status=status.HTTP_200_OK)


""" Api apiOverview """

@api_view(['GET'])
def apiOverview(request):
	api_urls = {
		'Usuarios':'/usuario-list',
		'Usuario Detail':'/usuario-detail/<str:pk>',
		'Usuario Create':'/usuario-create',
		'Usuario Update':'/usuario-update/<str:pk>',
		'Usuario Delete':'/usuario-delete/<str:pk>',

		'Img Usuarios':'/img-usuario-list',
		'Img Usuario Create':'/img-usuario-create',
		'Img Usuario Update':'/img-usuario-update/<str:pk>',
		'Img Usuario Delete':'/img-usuario-delete/<str:pk>',

		'Noticias':'/noticia-list',
		'Noticia Detail':'/noticia-detail/<str:pk>',
		'Noticia Create':'/noticia-create',
		'Noticia Update':'/noticia-update/<str:pk>',
		'Noticia Delete':'/noticia-delete/<str:pk>',

		'Banner Detail':'/banner-detail/<str:sector>',
		'Banner Create':'/banner-create',
		'Banner Update':'/banner-update/<str:sector>',
		'Banner Delete':'/banner-delete/<str:sector>',

		'Me Gusta Noticia':'/noticia-megusta',

		'Token': '/login',
		}
	
	return Response(api_urls)


""" Zona Usuario """

@api_view(['GET'])
def usuarioList(request):
	usuarios = Usuario.objects.order_by('-id')
	serializer = UsuarioSerializer(usuarios, many=True)

	return Response(serializer.data)


@api_view(['GET'])
def usuarioDetail(request, pk):
	data = {}
	try:
		usuario = Usuario.objects.get(id=pk)
		serializer = UsuarioSerializer(usuario, many=False)

		return Response(serializer.data, status=status.HTTP_200_OK)
		
	except:
		data["error"] = f"Ningun usuario con id #{pk}"
		return Response(data, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes(())
def usuarioCreate(request):
	serializer = UsuarioSerializer(data=request.data)
	data = {}

	if serializer.is_valid():
		try:
			usuario = Usuario.objects.get(username=serializer.validated_data["username"])
			data["error"] = f"El nombre de usuario ya existe"

			return Response(data, status=status.HTTP_401_UNAUTHORIZED)

		except:
			try:
				usuario = Usuario.objects.get(username=serializer.validated_data["email"])
				data["error"] = f"El email ya existe"

				return Response(data, status=status.HTTP_401_UNAUTHORIZED)
			
			except:
				cuenta = serializer.save()
				data['response'] = f"Usuario {cuenta.username} registrado con exito!"
				data["email"] = cuenta.email
				data["username"] = cuenta.username
				token = Token.objects.get(user=cuenta).key
				data["token"] = token
				
				return Response(data, status=status.HTTP_201_CREATED)

	else:
		data = serializer.errors
		return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(['POST'])
def usuarioUpdate(request, pk):
	usuario = Usuario.objects.get(id=pk)
	serializer = UsuarioSerializer(instance=usuario, data=request.data, partial=True)
	data = {}

	if serializer.is_valid():
		cuenta = serializer.save()
		data['response'] = f"Usuario {cuenta.username} modificado con exito!"
		data['email'] = cuenta.email
		data['username'] = cuenta.username
		token = Token.objects.get(user=cuenta).key
		data["token"] = token

	else:
		data = serializer.errors
	
	return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def usuarioDelete(request, pk):
	data = {}
	try:
		usuario = Usuario.objects.get(id=pk)
		if request.user == usuario:
			usuario.delete()
			data["success"] = "El usuario se ha borrado con exito!"
			return Response(data, status=status.HTTP_200_OK)

		else:
			print("El usuario que intenta borrar no es el mismo que esta logueado")
			data["error"] = "El usuario que intenta borrar no es el mismo que esta logueado"
			return Response(data, status=status.HTTP_403_FORBIDDEN)
	except:
		return Response("No se encontro ningun usuario con ese ID.", status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes(())
def usuarioLogin(request):
	data = {}

	if not request.user.is_authenticated:
		username = request.data["username"]
		password = request.data["password"]

		user = authenticate(request, username=username, password=password)

		if user is not None:
			login(request, user)
			data["success"] = f"Usuario {username} logeado con exito"
			data["status"] = 200

			return Response(data, status=status.HTTP_200_OK)

		else:
			try: # Prueba si existe el username. Si existe, devuelve el mail para autenticar.
				un = Usuario.objects.get(username=username)
				email = un.email

				user = authenticate(request, username=email, password=password)

				data["success"] = f"Usuario {username} logeado con exito"
				data["status"] = 200

				return Response(data, status=status.HTTP_200_OK)

			except:
				data["success"] = f"Usuario {username} no existe"
				data["status"] = 404

				return Response(data, status=status.HTTP_404_NOT_FOUND)
	
	else:
		logout(request)
		data["success"] = f"Usuario salio con exito"
		data["status"] = 205

		return Response(data, status=status.HTTP_205_RESET_CONTENT)

			

""" Zona Noticias """

@api_view(['GET'])
@permission_classes(())
def noticiaList(request):
	noticias = Noticia.objects.order_by('id')
	serializer = NoticiaSerializer(noticias, many=True)

	return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def noticiaDetail(request, pk):
	data = {}
	try:
		noticia = Noticia.objects.get(id=pk)
		serializer = NoticiaSerializer(noticia, many=False)
		return Response(serializer.data, status=status.HTTP_200_OK)
	
	except:
		return Response(f"Noticia nº{pk} no existe.", status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def noticiaCreate(request):
	serializer = CrearNoticiaSerializer(data=request.data)
	data = {}

	if serializer.is_valid():
		usuario = serializer.validated_data["usuario"]
		if usuario == request.user:
			serializer.save()

			data["noticia"] = serializer.data
			return Response(data, status=status.HTTP_200_OK)

		else:
			data["error"]= "El usuario no es el mismo que esta logueado o no se logueo."
			return Response(data, status=status.HTTP_401_UNAUTHORIZED)

	else:
		print(serializer.errors)
		return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(['DELETE'])
def noticiaDelete(request, pk):
	data = {}
	try:
		noticia = Noticia.objects.get(id=pk)
		if request.user.id == noticia.usuario.id:
			data["success"] = f"Noticia # {pk} eliminada con exito!"
			noticia.deleteImg()
			noticia.delete()
			return Response(f"Noticia # {pk} eliminada con exito!", status=status.HTTP_200_OK)
		
		return Response(f"El usuario no es el mismo que el autor de la noticia", status=status.HTTP_401_UNAUTHORIZED)
	
	except:
		return Response(f"No existe la noticia # {pk}")


@api_view(['POST'])
def noticiaUpdate(request, pk):
	try:
		noticia = Noticia.objects.get(id=pk)
		serializer = CrearNoticiaSerializer(instance=noticia, data=request.data, partial=True)

		data = {}

		if serializer.is_valid():

			try: # Analiza si se paso un id de usuario y checkea si es el mismo que el request user
				usuario = serializer.validated_data["usuario"]
				if usuario.id != request.user.id:
					data["error"] = "Se esta intentando pasar un id de usuario no correspondiente."
					return Response(data, status=status.HTTP_401_UNAUTHORIZED)
			except:
				pass

			if noticia.usuario.id == request.user.id:

				try:
					serializer.save()
					data["success"] = "Noticia actualizada con exito!"
					data["status"] = 200
					data["noticia"] = serializer.data["id"]
					return Response(data, status=status.HTTP_200_OK)

				except:
					data["error"] = "El guardado de la noticia no funciona."
					data["status"] = 500
					return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

			else:
				data["error"]= "El creador de la noticia no es el mismo que el que intenta modificarla."
				return Response(data, status=status.HTTP_401_UNAUTHORIZED)
		
		else:
			data["error"] = serializer.errors
			return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

	except:
		return Response(f"No existe la noticia # {pk}", status=status.HTTP_404_NOT_FOUND)


""" ZONA Img Usuario """

@api_view(['POST'])
def imgUsuarioCreate(request):
	serializer = ImgUsuarioSerializer(data=request.data)
	data = {}

	if serializer.is_valid():
		try:
			imgUsuario.objects.get(usuario=serializer.validated_data["usuario"])
			data["status"] = f"El usuario {serializer.validated_data['usuario']} ya tiene una imagen. Para cambiarla use /api/img-usuario-update/<id_usuario>"

			return Response(data, status=status.HTTP_403_FORBIDDEN)

		except:
			img = serializer.save()
			data["imgUsuario"] = serializer.data
			return Response(data, status=status.HTTP_200_OK)

	else:
		data = serializer.errors
		return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
	


@api_view(['PUT'])
def imgUsuarioUpdate(request, pk):
	data = {}
	try:
		usuario = Usuario.objects.get(id=pk)
		img = imgUsuario.objects.get(usuario=usuario)
		serializer = ImgUsuarioSerializer(instance=img, data=request.data, partial=True)

		if serializer.is_valid():
			serializer.save()
			data["cambio"] = serializer.data

		else:
			data["error"] = serializer.errors
			
	except:
		data["error"] = f"No existe usuario con id #{pk}"


	return Response(data)


@api_view(['GET'])
def imgUsuarioList(request):
	img = imgUsuario.objects.all().order_by('-id')
	serializer = ImgUsuarioSerializer(img, many=True)

	return Response(serializer.data)


@api_view(['DELETE'])
def imgUsuarioDelete(request, pk):
	try:
		img = imgUsuario.objects.get(id=pk)
		img.img.delete()
		img.delete()

	except:
		return Response("La imagen del Usuario no existe")

	return Response(f"Imagen # {pk} eliminada")



""" ZONA Me Gusta """
	
@api_view(['POST'])
def meGustaCreate(request):
	serializer = MeGustaSerializer(data=request.data)
	data = {}

	if serializer.is_valid():
		usuario = serializer.validated_data['usuario']
		noticia = serializer.validated_data['noticia']
		if usuario == request.user:
			try:	
				mg = meGusta.objects.get(usuario=usuario, noticia=noticia)
				data["megusta"] = f"El me gusta del usuario {usuario} se ha borrado con exito."
				mg.delete()
			
			except:
				mg = serializer.save()
				data["megusta"] = serializer.data
		else:
			data["error"] = f"El usuario logeado es {request.user.username} y se intenta agregar me gusta del usuario {usuario.username}"
	
	else:
		data = serializer.errors
	
	return Response(data)


""" Zona Banners """
@api_view(["GET"])
@permission_classes(())
def bannerDetail(request, sector):
	try:
		banner = Banner.objects.get(sector=sector)
		serializer = BannerSerializer(banner, many=False)
		return Response(serializer.data, status=status.HTTP_200_OK)

	except:
		return Response(f"El banner para el sector {sector} no existe.", status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def bannerCreate(request):
	serializer = BannerSerializer(data=request.data)
	data = {}

	if serializer.is_valid():
		if request.user.is_superuser:
			serializer.save()
			data["success"] = "Banner creado con exito!"
			data["status"] = 200
			data["banner"] = {"sector": serializer.data["sector"], "img": serializer.data["img"]}
			return Response(data, status=status.HTTP_200_OK)
		elif not request.user.is_superuser:
			data["error"] = "El usuario no es superuser."
			data["status"] = 401
			return Response(data, status=status.HTTP_401_UNAUTHORIZED)
		else:
			data["error"] = "El usuario no tiene tokens."
			data["status"] = 401
			return Response(data, status=status.HTTP_401_UNAUTHORIZED)
	
	else:
		data["error"] = serializer.errors
		data["status"] = 422
		return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(["POST"])
def bannerUpdate(request, sector):
	data = {}
	try:
		banner = Banner.objects.get(sector=sector)
		serializer = BannerSerializer(instance = banner, data=request.data, partial=True)

		if serializer.is_valid():

			try: # Analiza si se paso un id de usuario y checkea si es el mismo que el request user
				usuario = serializer.validated_data["usuario"]
				if usuario.id != request.user.id:
					data["error"] = "Se esta intentando pasar un id de usuario no correspondiente."
					data["status"] = 401
					return Response(data, status=status.HTTP_401_UNAUTHORIZED)
			except:
				pass

			if request.user.is_superuser:
				serializer.save()
				data["success"] = "Banner actualizado con exito!"
				data["status"] = 200
				data["banner"] = serializer.data
				return Response(data, status=status.HTTP_200_OK)

			else:
				data["error"] = "Al usuario le faltan permisos o no esta registrado."
				data["status"] = 401
				return Response(data, status=status.HTTP_401_UNAUTHORIZED)
		
		else:
			data["error"] = serializer.errors
			data["status"] = 422
			return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

	except:
		data["error"] = "El banner no existe"
		return  Response(data, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
def bannerDelete(request, sector):
	data = {}

	try:
		banner = Banner.objects.get(sector=sector)
		if request.user.is_superuser:
			banner.delete()
			data["success"] = f"Sector {sector} eliminado con exito!"
			data["status"] = 200

			return Response(data, status=status.HTTP_200_OK)
		
		else:
			data["error"] = "El usuario no tiene los permisos necesarios o no esta registrado."
			data["status"] = 401

			return Response(data, status=status.HTTP_401_UNAUTHORIZED)

	except:
		data["error"] = f"El sector {sector} no existe."
		data["status"] = 404
		
		return Response(data, status=status.HTTP_404_NOT_FOUND)


""" Zona Misiones """
@api_view(["POST"])
def misionCreate(request):
	serializer = MisionSerializer(data=request.data)
	data = {}
	if serializer.is_valid():
		if request.user.is_superuser:
			serializer.save()
			data["success"] = "Mision Creada con exito!"
			data["status"] = 200
			data["mision"] = serializer.data
			return Response(data, status=status.HTTP_200_OK)
		
		elif not request.user.is_superuser:
			data["error"] = "El usuario no es superuser."
			data["status"] = 401
			return Response(data, status=status.HTTP_401_UNAUTHORIZED)

		else:
			data["error"] = "El usuario no tiene tokens."
			data["status"] = 401
			return Response(data, status=status.HTTP_401_UNAUTHORIZED)
			
	else:
		data["error"] = serializer.errors
		data["status"] = 422
		return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


@api_view(["POST"])
def misionUpdate(request, pk):
	data = {}
	try:
		mision = Mision.objects.get(id=pk)
		serializer = MisionSerializer(instance=mision, data=request.data, partial=True)

		if serializer.is_valid():
			try: # Analiza si se paso un id de usuario y checkea si es el mismo que el request user
				usuario = serializer.validated_data["usuario"]
				if usuario.id != request.user.id:
					data["error"] = "Se esta intentando pasar un id de usuario no correspondiente."
					data["status"] = 401
					return Response(data, status=status.HTTP_401_UNAUTHORIZED)

			except:
				pass

			if request.user.is_superuser:
				serializer.save()
				data["success"] = "Mision actualizada con exito!"
				data["status"] = 200
				data["mision"] = serializer.data
				return Response(data, status=status.HTTP_200_OK)

			else:
				data["error"] = "Al usuario le faltan permisos o no esta registrado."
				data["status"] = 401
				return Response(data, status=status.HTTP_403_FORBIDDEN)

		else:
			data["error"] = serializer.errors
			data["status"] = 422
			return Response(data, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
		
	except:
		data["error"] = "La mision no existe"
		return  Response(data, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
def misionDelete(request, pk):
	data = {}

	try:
		mision = Mision.objects.get(id=pk)
		if request.user.is_superuser:
			mision.delete()
			data["success"] = f"Mision #{pk} eliminada con exito!"
			data["status"] = 200

			return Response(data, status=status.HTTP_200_OK)
		
		else:
			data["error"] = "El usuario no tiene los permisos necesarios o no esta registrado."
			data["status"] = 403

			return Response(data, status=status.HTTP_403_FORBIDDEN)

	except:
		data["error"] = f"La mision #{pk} no existe."
		data["status"] = 404
		
		return Response(data, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes(())
def misionDetail(request, pk):
	try:
		mision = Mision.objects.get(id=pk)
		serializer = MisionSerializer(mision, many=False)
		return Response(serializer.data, status=status.HTTP_200_OK)

	except:
		return Response(f"La mision #{pk} no existe.", status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes(())
def misionList(request):
	noticias = Mision.objects.order_by('id')
	serializer = MisionSerializer(noticias, many=True)

	return Response(serializer.data, status=status.HTTP_200_OK)

""" ZONA Pagination """
# Noticias Pagination
@permission_classes(())
class ApiNoticiaListView(ListAPIView):
	queryset = Noticia.objects.all().order_by('-id')
	serializer_class = NoticiaSerializer
	authentication_classes = (TokenAuthentication,)
	permission_classes = (IsAuthenticated,)
	pagination_class = PaginationClass
	# Filtros
	filter_backends = (SearchFilter, OrderingFilter)
	search_fields = ('titulo', 'subtitulo','descripcion','usuario__username')
