from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class UserProfile (models.Model):
    
    profile_name = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "user")
    profile_picture = models.ImageField (blank = True, null = True)
    profile_bio = models.TextField (blank = True, null = True)
    created = models.DateTimeField (auto_now_add = True)
    
    followings = models.ManyToManyField (User, related_name = "followings")
    
    def __str__(self):
            return self.profile_name
    
class Comment (models.Model):
    
    comment_author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "post_author")
    content = models.TextField (max_length = 256)
    created = models.DateTimeField (auto_now_add = True)
    
    def __str__(self):
        return f"{self.comment_author} left a comment."
    
class Post (models.Model):
    
    post_author = models.ForeignKey (User, on_delete = models.CASCADE, related_name = "comment_author")
    media = models.ImageField (upload_to = "media", height_field = None, width_field = None, blank = True)
    content = models.TextField ()
    created = models.DateTimeField (auto_now_add = True)
    modified = models.DateTimeField (auto_now_add = True)
    
    liked_by = models.ForeignKey (User, on_delete = models.CASCADE, related_name="likes")
    comments = models.ForeignKey (Comment, on_delete = models.CASCADE, related_name = "comments")

    def __str__(self):
        return f" {self.post_author} posted something"