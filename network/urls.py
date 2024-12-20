from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API endpoints
    
    path("posts/create", views.create_post, name="create"),
    path("post/<int:post_id>", views.content, name="content"),
    path("post/<int:post_id>/like", views.like_post, name="like"),
    path("posts/<str:scope>/<int:page>", views.posts, name="posts"),
    path("profile/<str:username>/follow", views.follow_user, name="follow"),
    path("profile/<str:username>/<int:page>", views.profile, name="profile")

] 