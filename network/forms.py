from django import forms
from .models import *
from django.core.exceptions import ValidationError 

class ProfileForm (forms.ModelForm):
    class Meta:
        model : UserProfile
        fields = ['profile_username', 'profile_name', 'profile_picture', 'profile_bio']
        labels = {
            
        }
        widgets = {
            
        }
        
class PostForm (forms.ModelForm):
    class Meta:
        model : Post
        fields = ['post_content', '']
        labels = {
            
        }
        widgets = {}
class CommentForm (forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['comment']
        labels = {'comment' : ''}
        widgets = {
            'comment': forms.Textarea(attrs={'placeholder': 'Write a comment..', 'class': 'comment-area'})
        }