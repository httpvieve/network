from datetime import time
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from .models import *
from .forms import *
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
MAX_POSTS = 10

def index(request):
    user = None
    if request.method == "POST":
        user = UserProfile.objects.get(user = request.user) 

    return render(request, "network/index.html", {
    'post_form': PostForm(),
    'profile': ProfileForm(instance=user)
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        first_name = request.POST["first_name"]
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.first_name = first_name
            user.save()
            profile  = UserProfile(user = user)
            profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def comment(request, post_id):
    
    post = Post.objects.get(pk=post_id)
    comments = post.comments.order_by('-created_at')
    
    if request.method == "POST":
        data = json.loads(request.body)
        comment = Comment(
            post = post,
            author = request.user,
            content = data.get("content")
            )
        comment.save()
        return JsonResponse({"message": "Comment added successfully.", "comment": comment.serialize()}, status=201)
    elif request.method == "GET":
        return JsonResponse({"comments": [comment.serialize() for comment in comments]}, safe=False)
    else: 
        return JsonResponse({"error": "Invalid request."}, status=400)

@csrf_exempt
@login_required 
def create_post(request):
    
    if request.method == 'POST':
        data = json.loads(request.body)
        post = Post(
                author = request.user,
                content = data.get("content")
                )
        post.save()
        return JsonResponse({ 'success': True, 'post': post.serialize(request.user)})


@csrf_exempt
@login_required 
def like_post (request, post_id):
    
    post = Post.objects.get (pk=post_id)
    
    if request.method == "PUT":
        # if liked -> unlike
        if request.user in post.liked_by.all():
            post.liked_by.remove(request.user)
        else:
            post.liked_by.add(request.user)
        return JsonResponse ({
            'success': True,
            'likes_count': post.liked_by.count(),
            'is_liked': request.user in post.liked_by.all()
        })
        
    return JsonResponse ({'success': False})


@csrf_exempt
@login_required 
def content(request, post_id):
    
    post = Post.objects.get(id=post_id)
    comments = post.comments.order_by('-created_at')
    if request.method == "GET":
        return JsonResponse({
                'success': True,
                'comments': [comment.serialize() for comment in comments],
                'post': post.serialize(request.user),
                'can_edit': post.author == request.user,
                'is_liked': request.user in post.liked_by.all(),
                'is_following': request.user in post.author.followers.all(),
                'comments_count': comments.count()
            })
        
    if request.method == "PUT":

        data = json.loads(request.body)
        post.content = data.get('content', post.content)
        post.save()
        return JsonResponse({
            'success': True,
            'post': post.serialize(request.user)
        })

    if request.method == "POST":
        
        data = json.loads(request.body)
        comment = Comment(
            post = post,
            author = request.user,
            content = data.get("content")
            )
        comment.save()
        return JsonResponse({"message": "Comment added successfully.", "comment": comment.serialize()}, status=201)

def filter (request, scope, page):
    
    if scope == "all":
        entries = Post.objects.all()
    elif scope == "following":
        entries = Post.objects.filter(author__in=request.user.following.all())
    else: 
        entries = Post.objects.filter(author = User.objects.get(username = scope))  
        
    posts, has_next, has_previous = paginate (entries, page)
    return posts, has_next, has_previous

@login_required 
def posts(request, scope, page):
    
    posts, has_next, has_previous = filter (request, scope, page)
    return JsonResponse  ({
            'posts': [entry.serialize(request.user) for entry in posts],
            'page_number': page,
            'has_next': has_next,
            'has_previous': has_previous,
        })

def paginate (posts, index):
    
    posts = posts.order_by('-created_at').all()
    paginator = Paginator (posts, MAX_POSTS)
    current = paginator.page(index)
    entries = current.object_list
    has_next, has_previous = current.has_next(), current.has_previous()
    
    return entries, has_next, has_previous

@csrf_exempt
@login_required 
def profile (request, username, page):
    user = User.objects.get(username = username)
    profile = UserProfile.objects.get(user = user)
    if request.method == "GET":         
        posts, has_next, has_previous = filter (request, username, page)
        
        return JsonResponse ({'following': user.following.count(),
                            'followers': user.followers.count(),
                            'current_following': [profile.serialize() for profile in request.user.following.all()],
                            'following_list': [profile.serialize() for profile in user.following.all()],
                            'follower_list': [profile.serialize() for profile in user.followers.all()],
                            'profile': profile.serialize(),
                            'current_user': request.user.serialize(),
                            'can_edit': user == request.user,
                            'has_bio': profile.bio != None,
                            'is_following': request.user in user.followers.all(),
                            'posts': [entry.serialize(request.user) for entry in posts], 
                            'page_number': page, 'has_next': has_next, 'has_previous': has_previous})
    
    if request.method == "PUT":
        
        data = json.loads(request.body)
        profile.bio = data.get('bio', profile.bio)
        profile.save()
        
        return JsonResponse({
            'success': True,
            'profile': profile.serialize(),
        })
        
@csrf_exempt
@login_required 
def follow_user (request, username):
    
    profile = User.objects.get (username = username)
    is_followed = profile in request.user.following.all()
    is_follower = request.user in profile.followers.all()
    
    if request.method == "PUT":
        if is_followed and is_follower:
            profile.followers.remove(request.user)
            request.user.following.remove(profile)
        else:
            profile.followers.add(request.user)
            request.user.following.add(profile)
        return JsonResponse ({
            'success': True,
            'is_following': is_followed == is_follower
        })
    return JsonResponse ({'success': False})