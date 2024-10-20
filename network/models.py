from django.contrib.auth.models import AbstractUser
from django.db import models

class User (AbstractUser):

    following = models.ManyToManyField('self', symmetrical=False, blank = True, related_name='user_following')
    followers = models.ManyToManyField('self', symmetrical=False, blank = True, related_name='user_followers')
    profile_picture = models.ImageField(upload_to = "profile_pictures/", blank = True, null = True)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'profile_picture': self.profile_picture.url if self.profile_picture else None
        }

class UserProfile (models.Model):
    
    user = models.OneToOneField(User, on_delete = models.CASCADE, related_name = 'profile')
    bio = models.TextField(blank = True)
    created_at = models.DateTimeField(auto_now_add = True)
    
    def serialize (self):
        return {
            'id': self.id,
            'user': self.user.serialize(),
            'bio': self.bio,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    def __str__(self):
        return f"{self.user.username}'s profile"

class Post (models.Model):
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'posts')
    content = models.TextField()
    media = models.ImageField(upload_to = "posts/", blank = True, null = True)
    created_at = models.DateTimeField(auto_now_add = True)
    modified_at = models.DateTimeField(auto_now = True)
    liked_by = models.ManyToManyField(User, related_name = 'liked_posts', blank = True)
    
    def likes_count (self):
        return self.liked_by.all().count()
    
    def serialize(self, user):
            return {
            'id': self.id,
            'author': {
                'username': self.author.username,
                'first_name': self.author.first_name,
                'profile_picture': self.author.profile_picture.url if self.author.profile_picture else None,
            },
            "is_liked": user in self.liked_by.all(),
            'content': self.content,
            'media': self.media.url if self.media else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'modified_at': self.modified_at.strftime('%Y-%m-%d %H:%M'),
            'likes_count': self.likes_count(),
            
        }

    def __str__(self):
        return f"Post by {self.author.username} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Comment (models.Model):
    
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name = 'comments')
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'comments')
    content = models.TextField(max_length = 256)
    created_at = models.DateTimeField(auto_now_add = True)
    
    def serialize(self):
        return {
            'id': self.id,
            'post_id': self.post.id,
            'author': self.author.serialize(),
            'content': self.content,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"