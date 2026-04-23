from django.urls import path
from .views import (
    create_room,
    get_rooms,
    delete_room,
    get_room,
    update_room,
    request_review_room,
    publish_room,
    get_my_rooms,
    get_allowed_rooms,
)

urlpatterns = [
    path('create/', create_room),
    path('', get_rooms),
    path('my-rooms/', get_my_rooms),
    path('allowed/', get_allowed_rooms),
    path('<int:room_id>/delete/', delete_room),
    path('<int:room_id>/', get_room),
    path('<int:room_id>/update/', update_room),
    path('<int:room_id>/request-review/', request_review_room),
    path('<int:room_id>/publish/', publish_room),
]