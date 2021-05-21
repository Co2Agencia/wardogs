from django.core.files.storage import FileSystemStorage
from django.conf import settings
from rest_framework import pagination
from rest_framework.response import Response


# Almacenamiento
class OverwriteStorage(FileSystemStorage):
    # Devuelve el mismo nombre para los archivos que ya existen
    # y elimina los archivos existententes al guardarlos.
    def _save(self, name, content):
        self.delete(name)
        
        return super(OverwriteStorage, self)._save(name, content)

    def get_available_name(self, name, max_length=None):
        return name


# Pagination
class PaginationClass(pagination.PageNumberPagination):

    def get_paginated_response(self, data):
        return Response({
            'links': {
               'next': self.get_next_link(),
               'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current': self.page.number,
            'results': data,
        })