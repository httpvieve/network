
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API endpoints
    path("posts/<str:scope>/<int:page>", views.posts, name="posts"),
    path("posts/create", views.create_post, name="create"),
    path("post/<int:post_id>", views.content, name="content"),
    
    path("profile/<str:username>/<int:page>", views.profile, name="profile"),
    # path("profile/<str:username>/edit", views.edit_profile, name=""),
    # path("profile/<str:username>/followings", views.follows, name="follows"),
    # path("profile/<str:username>/likes", views.likes, name="likes"),
    
]
