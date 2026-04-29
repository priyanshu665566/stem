from django.urls import path
from .views import (
    create_city,
    get_cities,
    delete_city,
    get_city,
    update_city,
    request_review_city,
    publish_city,
    get_city_by_slug,
    get_my_cities,
    manage_city_logo,
    get_city_rooms,
    update_city_navbar_slots,
)

urlpatterns = [
    path('create/', create_city),
    path('', get_cities),
    path('slug/<slug:slug>/', get_city_by_slug),
    path('my-cities/', get_my_cities),
    path('<int:city_id>/delete/', delete_city),
    path('<int:city_id>/', get_city),
    path('<int:city_id>/update/', update_city),
    path('<int:city_id>/logo/', manage_city_logo),
    path('<int:city_id>/rooms/', get_city_rooms),
    path('<int:city_id>/navbar-slots/', update_city_navbar_slots),
    path('<int:city_id>/request-review/', request_review_city),
    path('<int:city_id>/publish/', publish_city),
]