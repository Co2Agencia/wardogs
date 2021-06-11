import os, glob
from django.test import TestCase
from django.test.client import Client
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase
from django.urls import reverse
from rest_framework import response, status
from .models import Usuario, imgUsuario, Noticia, Banner, meGusta, Mision,SECTORES_NOMBRES
from django.core.files.uploadedfile import SimpleUploadedFile


class TestUtils():
    usuarios_data = {
        "username": "Pepito",
        "email": "pepe@gmail.com",
        "username2": "Norma",
        "email2": "norma@gmail.com",
        "password": "pepe123",
    }

    def temporary_image(self):
        from io import BytesIO
        from PIL import Image

        bts = BytesIO()
        img = Image.new("RGB", (100, 100))
        img.save(bts, 'jpeg')
        return SimpleUploadedFile("test.jpg", bts.getvalue())
    
    def token_key(self, username):
        token = Token.objects.get(user__username=username)
        token = f'Token {token.key}'

        return token

    def client_login(self, username):
        password = self.usuarios_data["password"]

        client = APIClient()
        client.login(username=username, password=password)
        token = self.token_key(username)
        client.credentials(HTTP_AUTHORIZATION=token)

        return client

    def usuario_get(self, num):
        if num == 1:
            usuario = Usuario.objects.get(username=self.usuarios_data["username"])
            return usuario
        
        elif num == 2:
            usuario = Usuario.objects.get(username=self.usuarios_data["username2"])
            return usuario

""" Test Usuarios """
class UsuarioTest(APITestCase):
    tu = TestUtils()

    username = tu.usuarios_data["username"]
    email = tu.usuarios_data["email"]
    password = tu.usuarios_data["password"]

    def setUp(self):
        url = reverse('api:usuario-create')
        data = {'username': self.username, 'email':self.email, 'password':self.password}
        self.client.post(url, data, format='json')


    def test_crear_usuario(self):
        self.assertEqual(Usuario.objects.count(), 1)
        self.assertEqual(Usuario.objects.get(username=self.username).username, self.username)
    

    def test_crear_duplicado_error_usuario(self):
        url = reverse('api:usuario-create')
        data = {'username': self.username, 'email':self.email, 'password':self.password}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)


    def test_get_token(self):
        url = reverse('api:token')
        data = {'username': self.username, 'password':self.password}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_usuario_detail(self):
        client = self.tu.client_login(self.username)

        usuario = self.tu.usuario_get(1)

        url = reverse('api:usuario-detail', kwargs={'pk':usuario.id})
        url2 = reverse('api:usuario-detail', kwargs={'pk':usuario.id+5})

        response_token = client.get(url)
        response_404 = client.get(url2)

        client.credentials()
        response_no_token = client.get(url)

        self.assertEqual(response_token.status_code, status.HTTP_200_OK)
        self.assertEqual(response_no_token.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response_404.status_code, status.HTTP_404_NOT_FOUND)


    def test_usuario_delete_token(self):
        client = self.tu.client_login(self.username)

        usuario = self.tu.usuario_get(1)

        url = reverse('api:usuario-delete', kwargs={'pk':usuario.id})

        
        response_token = client.delete(url)
        
        client.credentials()
        
        self.assertEqual(response_token.status_code, status.HTTP_200_OK)


    def test_usuario_delete_not_found(self):
        client = self.tu.client_login(self.username)

        url2 = reverse('api:usuario-delete', kwargs={'pk':100})
        response_token2 = client.delete(url2)

        self.assertEqual(response_token2.status_code, status.HTTP_404_NOT_FOUND)


    def test_usuario_delete_no_session(self):
        client = self.tu.client_login(self.username)

        client.force_authenticate(user=None)

        url = reverse('api:usuario-delete', kwargs={'pk':1})
        response_no_session = client.delete(url)

        self.assertEqual(response_no_session.status_code, status.HTTP_401_UNAUTHORIZED)

    
    def test_usuario_delete_no_token(self):
        client = self.tu.client_login(self.username)
        client.credentials()

        usuario = self.tu.usuario_get(1)

        url = reverse('api:usuario-delete', kwargs={'pk':usuario.id})
        response_no_token = client.delete(url)

        self.assertEqual(response_no_token.status_code, status.HTTP_401_UNAUTHORIZED)

    # Img usuario
    def test_img_usuario_create(self):
        client = self.tu.client_login(self.username)
        img = self.tu.temporary_image()

        url = reverse("api:img-usuario-create")
        usuario = Usuario.objects.get(username=self.username)
        data = {"img":img, "usuario": usuario.id}
        response = client.post(url, data, format="multipart")

        # Eliminar Img
        imgUs = imgUsuario.objects.get(pk=1)
        imgUs.deleteImg()

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Login/Logout
    def test_login_logout(self):
        # user = Usuario.objects.create(username=self.username, email)
        url = reverse('api:login')
        data_username = {"username":self.username, "password":self.password}
        data_email = {"username":self.email, "password":self.password}
        data_404 = {"username":"True", "password":"True"}

        response_username = self.client.post(url, data_username)
        response_email = self.client.post(url, data_email)
        response_404 = self.client.post(url, data_404)

        client = self.tu.client_login(self.username) # Logeandonos para despues
        response_logout = client.post(url, data_username) # Desloguearnos
        

        self.assertEqual(response_username.status_code, status.HTTP_200_OK)
        self.assertEqual(response_email.status_code, status.HTTP_200_OK)
        self.assertEqual(response_logout.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(response_404.status_code, status.HTTP_404_NOT_FOUND)


""" Test Noticia """
class NoticiaTest(APITestCase):
    tu = TestUtils()

    username = tu.usuarios_data["username"]
    email = tu.usuarios_data["email"]
    password = tu.usuarios_data["password"]

    def setUp(self):
        # Creando usuario
        url = reverse('api:usuario-create')
        data = {'username': self.username, 'email':self.email, 'password':self.password}
        response_client = self.client.post(url, data, format='json')
        usuario = Usuario.objects.get(username= self.username)

        client = self.tu.client_login(self.username)
        img = self.tu.temporary_image()
        # Noticia
        url = reverse('api:noticia-create')
        data = {'usuario': usuario.pk, "titulo":"test", "subtitulo":"test", "descripcion":"test", "img": img}
        response = client.post(url, data,format="multipart")


    def test_noticia_list(self):
        client = APIClient()
        url = reverse('api:noticia-list')
        response = client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_noticia_detail(self):
        client = self.tu.client_login(self.username)

        noticia = Noticia.objects.get(titulo="test")

        url1 = reverse('api:noticia-detail', kwargs={"pk":noticia.id})
        url2 = reverse('api:noticia-detail', kwargs={"pk":noticia.id+5})

        response_si_noticia = client.get(url1)
        response_no_noticia = client.get(url2)

        self.assertEqual(response_si_noticia.status_code, status.HTTP_200_OK)
        self.assertEqual(response_no_noticia.status_code, status.HTTP_404_NOT_FOUND)

        
    def test_noticia_update(self):
        client = self.tu.client_login(self.username)

        noticia = Noticia.objects.get(titulo="test")

        url = reverse('api:noticia-update', kwargs={"pk":noticia.id})
        data = {"titulo":"test2", "subtitulo":"test2", "descripcion":"test2", "img": self.tu.temporary_image()}

        response_si_noticia = client.post(url, data, format="multipart")
        client.credentials()
        response_no_noticia = client.post(url, data, format="multipart")

        self.assertEqual(response_si_noticia.status_code, status.HTTP_200_OK)
        self.assertEqual(response_no_noticia.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_noticia_delete_token(self):
        client = self.tu.client_login(self.username)

        url = reverse('api:noticia-delete', kwargs={"pk":1})
        response = client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_noticia_delete_no_token(self):
        client = self.tu.client_login(self.username)
        client.credentials()

        url = reverse('api:noticia-delete', kwargs={"pk":1})
        response = client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


""" Test Banner """
class BannerTest(APITestCase):
    tu = TestUtils()

    username = tu.usuarios_data["username"]
    email = tu.usuarios_data["email"]
    password = tu.usuarios_data["password"]

    username2 = tu.usuarios_data["username2"]
    email2 = tu.usuarios_data["email2"]

    def setUp(self):
        # Creando Super usuario
        url = reverse('api:usuario-create')
        data = {'username': self.username, 'email':self.email, 'password':self.password}
        response1 = self.client.post(url, data, format='json')
        usuario = Usuario.objects.get(username= self.username)

        
        usuario.is_superuser = True
        usuario.save()

        # Creando usuario 2
        url = reverse('api:usuario-create')
        data = {'username': self.username2, 'email':self.email2, 'password':self.password}
        response1 = self.client.post(url, data, format='json')
        usuario2 = Usuario.objects.get(username= self.username2)


        client = self.tu.client_login(self.username)

        # Crea un banner por sector
        url = reverse('api:banner-create')
        for sector in SECTORES_NOMBRES:
            data = {'usuario': usuario.pk, "sector":sector[1], "img": self.tu.temporary_image()}
            response = client.post(url, data,format="multipart")


    def test_banner_detail(self):
        client = self.tu.client_login(self.username)
        client.credentials()

        # Ve los datos de cada sector
        for sector in SECTORES_NOMBRES:
            url = reverse('api:banner-detail', kwargs={"sector":sector[1]})
            response = client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_banner_update(self):
        # Usuario Superuser
        client = self.tu.client_login(self.username)
        usuario = self.tu.usuario_get(1)

        # Usuario No Superuser
        client2 = self.tu.client_login(self.username2)
        usuario2 = self.tu.usuario_get(2)

        for sector in SECTORES_NOMBRES:
            url = reverse(f'api:banner-update', kwargs={"sector": sector[1]})
            data = {'usuario': usuario.id, "sector":sector[1], "img": self.tu.temporary_image()}
            data2 = {'usuario': usuario2.id, "sector":sector[1], "img": self.tu.temporary_image()}

            response_superuser = client.post(url, data,format="multipart")
            response_no_superuser = client2.post(url, data2,format="multipart")

            self.assertEqual(response_superuser.status_code, status.HTTP_200_OK)
            self.assertEqual(response_no_superuser.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_banner_delete(self):
        # Usuario SuperUser
        client = self.tu.client_login(self.username)

        # Usuario No SuperUser
        client2 = self.tu.client_login(self.username2)


        for sector in SECTORES_NOMBRES:
            url = reverse(f'api:banner-delete', kwargs={"sector": sector[1]})

            # Response Usuario No superuser
            response = client2.delete(url)

            # Response Usuario Superuser
            response_superuser = client.delete(url)
            
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertEqual(response_superuser.status_code, status.HTTP_200_OK)


""" Test Mision """
class MisionTest(APITestCase):
    tu = TestUtils()

    username = tu.usuarios_data["username"]
    email = tu.usuarios_data["email"]
    username2 = tu.usuarios_data["username2"]
    email2 = tu.usuarios_data["email2"]

    password = tu.usuarios_data["password"]

    def setUp(self):
        # Creando Superusuario
        url = reverse('api:usuario-create')
        data = {'username': self.username, 'email':self.email, 'password':self.password}
        self.client.post(url, data, format='json')
        usuario = self.tu.usuario_get(1)

        usuario.is_superuser = True
        usuario.save()

        # Creando usuario no Super
        data2 = {'username': self.username2, 'email':self.email2, 'password':self.password}
        self.client.post(url, data2)
        usuario2 = self.tu.usuario_get(2)


        client_superuser = self.tu.client_login(self.username)
        url_field = "https://www.youtube.com/watch?v=9P1HtbpGSCk"
        img = self.tu.temporary_image()
        # Mision
        url = reverse('api:mision-create')
        data = {'usuario': usuario.pk, "titulo":"test", "subtitulo":"test", "img": img, "url":url_field}
        response = client_superuser.post(url, data,format="multipart")

    
    def test_mision_list(self):
        client = APIClient()
        url = reverse('api:mision-list')
        response = client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_mision_detail(self):
        client = self.tu.client_login(self.username)
        mision = Mision.objects.get(titulo="test")

        url1 = reverse('api:mision-detail', kwargs={"pk":mision.id})
        url2 = reverse('api:mision-detail', kwargs={"pk":mision.id+1})

        response_si_mision = client.get(url1)
        response_no_mision = client.get(url2)

        self.assertEqual(response_si_mision.status_code, status.HTTP_200_OK)
        self.assertEqual(response_no_mision.status_code, status.HTTP_404_NOT_FOUND)

        
    def test_mision_update(self):
        client_superuser = self.tu.client_login(self.username)
        client_no_superuser_id_error = self.tu.client_login(self.username2)
        client_no_superuser = self.tu.client_login(self.username2)
        
        mision = Mision.objects.get(titulo="test")
        superuser = self.tu.usuario_get(1)
        no_superuser = self.tu.usuario_get(2)

        url = reverse('api:mision-update', kwargs={"pk":mision.id})
        data = {'usuario': superuser.id, "titulo":"test", "subtitulo":"test", "img": self.tu.temporary_image(), "url": "https://www.youtube.com/watch?v=JQ1mXXmJDYI"}
        data2 = {'usuario': superuser.id, "titulo":"test", "subtitulo":"test", "img": self.tu.temporary_image()}
        data3 = {'usuario': no_superuser.id, "titulo":"test", "subtitulo":"test", "img": self.tu.temporary_image()}

        response_superuser = client_superuser.post(url, data, format="multipart")
        client_no_superuser_id_error = client_no_superuser_id_error.post(url, data2, format="multipart")
        response_no_superuser = client_no_superuser.post(url, data3, format="multipart")

        self.assertEqual(response_superuser.status_code, status.HTTP_200_OK)
        self.assertEqual(client_no_superuser_id_error.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response_no_superuser.status_code, status.HTTP_403_FORBIDDEN)


    def test_mision_delete(self):
        client_superuser = self.tu.client_login(self.username)
        client_no_superuser = self.tu.client_login(self.username2) # No es superuser, tendria que salir error 403

        url = reverse('api:mision-delete', kwargs={"pk":1})
        url2 = reverse('api:mision-delete', kwargs={"pk":2}) # Mision no existe, tendria que salir error 404

        response_no_superuser = client_no_superuser.delete(url) # No es superuser
        response_superuser_not_found = client_superuser.delete(url2) # No existe la mision
        client_superuser.credentials() # Quitando Token
        response_superuser_no_token = client_superuser.delete(url) # Superuser no tiene token

        client_superuser.credentials(HTTP_AUTHORIZATION=self.tu.token_key(self.username)) # Poniendo Token
        response_superuser_token = client_superuser.delete(url) # Superuser tiene token

        self.assertEqual(response_superuser_token.status_code, status.HTTP_200_OK)
        self.assertEqual(response_superuser_no_token.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response_superuser_not_found.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response_no_superuser.status_code, status.HTTP_403_FORBIDDEN)

