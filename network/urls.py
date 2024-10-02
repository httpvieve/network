
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    path("posts/<str:scope>/<int:page>", views.posts, name="posts"),
    path("posts/create", views.create, name="create"),
    # path("posts/<int:post_id>", views.post, name="post"),
    
    path("profile/<str:username>", views.profile, name="profile"),
    # path("profile/<str:username>/edit", views.edit_profile, name=""),
    # path("profile/<str:username>/followings", views.follows, name="follows"),
    # path("profile/<str:username>/likes", views.likes, name="likes"),
    
]
