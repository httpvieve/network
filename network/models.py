from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image

def resize_image(image_path, new_width, new_height):
    img = Image.open(image_path)
    img.thumbnail((new_width, new_height))
    img.save(image_path)
    
class User (AbstractUser):
    followings = models.ManyToManyField('self', symmetrical = False, related_name = 'followers')

class UserProfile (models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE, related_name = 'profile')
    profile_picture = models.ImageField(upload_to = 'profile_pics', blank = True, null = True)
    bio = models.TextField(blank = True, null = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.user.username}'s profile"

class Post (models.Model):
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'posts')
    content = models.TextField()
    media = models.ImageField(upload_to = 'static/media/', blank = True, null = True)
    created_at = models.DateTimeField(auto_now_add = True)
    modified_at = models.DateTimeField(auto_now = True)
    liked_by = models.ManyToManyField(User, related_name = 'liked_posts', blank = True)
    
    
    def save(self, *args, **kwargs):
        if self.media:
            resize_image(self.media.path, 640, 480)  # Adjust dimensions as needed
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Post by {self.author.username} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Comment (models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name = 'comments')
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'comments')
    content = models.TextField(max_length = 256)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"