from django.urls import path
from .views import (
    register,
    login,
    forgot_password,
    reset_password,
    get_users,
    get_all_users,   
    create_user,     
    update_user,     
    delete_user,
    get_profile,
    update_profile,
    change_password,
    upload_avatar,
    get_user_activity_logs,
    get_all_thumbnails,
    get_featured_thumbnails,
    create_thumbnail,
    delete_thumbnail,
    toggle_featured_thumbnail,
    update_thumbnail,
    increment_usage_count,
)
 
urlpatterns = [
    path('register/',register), 
    path('login/',login),
    path('forgot-password/',forgot_password),
    path('reset-password/',reset_password),
    
    
    
    path('users/', get_users),
    path('users/all/', get_all_users),
    path('users/create/', create_user),
    path('users/<int:user_id>/update/', update_user),
    path('users/<int:user_id>/delete/', delete_user),
    path('users/<int:user_id>/activity/', get_user_activity_logs),
    path('user/profile/', get_profile),
    path('user/profile/update/', update_profile),
    path('user/password/', change_password),
    path('user/avatar/', upload_avatar),
    
    # Thumbnail Asset Endpoints
    path('thumbnails/featured/', get_featured_thumbnails),
    path('thumbnails/create/', create_thumbnail),
    path('thumbnails/<int:thumbnail_id>/delete/', delete_thumbnail),
    path('thumbnails/<int:thumbnail_id>/feature/', toggle_featured_thumbnail),
    path('thumbnails/<int:thumbnail_id>/update/', update_thumbnail),
    path('thumbnails/<int:thumbnail_id>/increment-usage/', increment_usage_count),
    path('thumbnails/', get_all_thumbnails),
]
