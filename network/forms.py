from django import forms
from .models import *
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError 

User = get_user_model()
class ProfileForm(forms.ModelForm):
    
    username = forms.CharField(max_length = 150)
    first_name = forms.CharField(max_length = 30, required = False)

    class Meta:
        model = UserProfile
        fields = ['profile_picture', 'bio']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.user:
            self.fields['username'].initial = self.instance.user.username
            self.fields['first_name'].initial = self.instance.user.first_name
            
    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.exclude(pk=self.instance.user.pk).filter(username=username).exists():
            raise forms.ValidationError("A user with that username already exists.")
        return username

    def save(self, commit=True):
        profile = super().save(commit=False)
        user = profile.user
        user.username = self.cleaned_data['username']
        user.first_name = self.cleaned_data['first_name']
        if commit:
            user.save()
            profile.save()
        return profile

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content', 'media']
        labels = {
            'content': 'What\'s on your mind?',
        }
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Share your thoughts...'}),
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        labels = {'content': ''}
        widgets = {
            'content': forms.Textarea(attrs={'placeholder': 'Write a comment...', 'class': 'comment-area', 'rows': 2})
        }