"""
Servicio del módulo de noticias.
"""
from services.base_service import BaseCRUDService
from models.modelos import Noticia


class NoticiaService(BaseCRUDService):
    def __init__(self):
        super().__init__(Noticia)


noticias_service = NoticiaService()
