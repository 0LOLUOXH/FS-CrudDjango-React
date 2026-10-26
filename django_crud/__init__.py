"""
Inicialización del proyecto Django django_crud.
Incluye compatibilidad para Python 3.14+ con Django 5.0.x (BaseContext.__copy__).
"""
import sys
import copy

# En Python 3.14+, copy(super()) retorna un objeto 'super' sin __dict__,
# lo que causaba AttributeError en BaseContext.__copy__ de Django 5.0.
# Este parche asegura compatibilidad total con Python 3.14+ en todas las vistas y templates del admin.
try:
    from django.template import context as django_context

    def _fixed_base_context_copy(self):
        duplicate = object.__new__(self.__class__)
        duplicate.__dict__ = copy.copy(self.__dict__)
        duplicate.dicts = self.dicts[:]
        return duplicate

    django_context.BaseContext.__copy__ = _fixed_base_context_copy
except Exception:
    pass
