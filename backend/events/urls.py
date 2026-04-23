from django.urls import path
from .views import (
    create_event,
    get_events,
    update_event,
    delete_event,
    publish_event,
    get_my_events,
    get_user_events,
)

urlpatterns = [
    path('create/', create_event),
    path('', get_events),
    path('my-events/', get_my_events),
    path('user-events/', get_user_events),
    path('<int:event_id>/update/', update_event),
    path('<int:event_id>/delete/', delete_event),
    path('<int:event_id>/publish/', publish_event),
]