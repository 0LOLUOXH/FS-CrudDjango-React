from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .middleware import get_current_user


def _get_actor():
    """
    Devuelve el usuario autenticado actual.
    Si no hay sesión activa (cron, shell, tests), devuelve None
    y AuditLog lo guardará como NULL, interpretado como 'sistema'.
    """
    user = get_current_user()
    if user and user.is_authenticated:
        return user
    return None


def _log(action, instance, description):
    """Helper para crear un registro de AuditLog sin repetir código."""
    # Importación diferida para evitar circular imports
    from .models import AuditLog
    try:
        AuditLog.objects.create(
            user=_get_actor(),
            action=action,
            table_name=instance.__class__.__name__,
            record_id=instance.pk,
            description=description,
        )
    except Exception:
        # El audit trail nunca debe romper la operación principal
        pass


# ─────────────────────────────────────────
# PRODUCT  (CREATE / UPDATE)
# ─────────────────────────────────────────

@receiver(pre_save, sender='fs.Product')
def product_pre_save(sender, instance, **kwargs):
    """Marca si el producto es nuevo antes de guardarlo."""
    instance._is_new = not bool(instance.pk)


@receiver(post_save, sender='fs.Product')
def product_post_save(sender, instance, created, **kwargs):
    if created:
        _log(
            action='CREATE',
            instance=instance,
            description=f"Producto creado: '{instance.name}' | Stock inicial: {instance.stock_quantity}"
        )
    else:
        _log(
            action='UPDATE',
            instance=instance,
            description=f"Producto actualizado: '{instance.name}' | Stock actual: {instance.stock_quantity}"
        )


@receiver(post_delete, sender='fs.Product')
def product_post_delete(sender, instance, **kwargs):
    _log(
        action='DELETE',
        instance=instance,
        description=f"Producto eliminado: '{instance.name}' (ID: {instance.pk})"
    )


# ─────────────────────────────────────────
# SALE  (CREATE / UPDATE)
# ─────────────────────────────────────────

@receiver(post_save, sender='fs.Sale')
def sale_post_save(sender, instance, created, **kwargs):
    if created:
        _log(
            action='CREATE',
            instance=instance,
            description=(
                f"Venta registrada | Cliente ID: {instance.customer_id} | "
                f"Total: {instance.currency} {instance.total_amount} | "
                f"Método pago: {instance.payment_method}"
            )
        )
    else:
        _log(
            action='UPDATE',
            instance=instance,
            description=(
                f"Venta actualizada | Estado: {instance.status} | "
                f"Total: {instance.currency} {instance.total_amount}"
            )
        )


@receiver(post_delete, sender='fs.Sale')
def sale_post_delete(sender, instance, **kwargs):
    _log(
        action='DELETE',
        instance=instance,
        description=f"Venta eliminada | ID: {instance.pk} | Cliente ID: {instance.customer_id}"
    )


# ─────────────────────────────────────────
# CUSTOMER  (CREATE / UPDATE / DELETE)
# ─────────────────────────────────────────

@receiver(post_save, sender='fs.Customer')
def customer_post_save(sender, instance, created, **kwargs):
    if created:
        _log(
            action='CREATE',
            instance=instance,
            description=f"Cliente creado | Tipo: {instance.customer_type} | Teléfono: {instance.phone}"
        )
    else:
        _log(
            action='UPDATE',
            instance=instance,
            description=f"Cliente actualizado | Tipo: {instance.customer_type} | Teléfono: {instance.phone}"
        )


@receiver(post_delete, sender='fs.Customer')
def customer_post_delete(sender, instance, **kwargs):
    _log(
        action='DELETE',
        instance=instance,
        description=f"Cliente eliminado | ID: {instance.pk} | Tipo: {instance.customer_type}"
    )
