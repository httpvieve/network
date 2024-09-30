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

MAX_POSTS = 10

def index(request):
    # all_posts = Post.objects.all().order_by('-created_at')
    # followed_posts = Post.objects.filter(author__in=request.user.following.all())

    # create_post(request)
    # page = Paginator (all_posts, MAX_POSTS)
    # current = page.get_page(request.GET.get('page'))
    
    return render(request, "network/index.html", {
    })


def profile_view (request, user_id):
    current_user = User.objects.get(pk = user_id)
    user_profile = UserProfile.objects.get(user = current_user)
    
    user_posts = Post.objects.filter(author = user_profile.user).order_by('-created_at')
    page = Paginator (user_posts, MAX_POSTS)
    current = page.get_page(request.GET.get('page'))
    
    return render(request, "network/index.html", {
        'page': current,
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
def create_post (request):
    if request.method == 'POST':
        new_entry = Post (
            author = request.user,
            content = request.POST['content'],
            media = request.POST['media']  
        )
        new_entry.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/index.html")
    
def posts(request, scope):
    
    if scope == "all":
        posts = Post.objects.all()
    elif scope == "following":
        posts = Post.objects.filter(author__in=request.user.following.all())
    else: 
        return HttpResponseBadRequest("Invalid scope.")

    posts = posts.order_by('-created_at')
    
    paginator = Paginator(posts, MAX_POSTS)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'posts': page_obj,
        'page': page_obj,
        'scope': scope,
    }
    
    return render(request, "network/posts.html", context)

# def content (request, post_id):
    
def profile (request, user):
    followers, following = [], []
    all_users = User.objects.all()
    user_profile = UserProfile.objects.get(user = user)
    
    for profile in all_users:
        if user in profile.following.all():
            followers.append(profile.user)
        if profile in user_profile.user.following.all():
            following.append(profile)

    context = {
        'user_profile': user_profile,
        'followers': followers,
        'following': following,
    }
    
    return render(request, 'index.html', context)
    