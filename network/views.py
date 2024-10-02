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
    return render(request, "network/index.html", {
    'post_form': PostForm()
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
def create(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            new_entry = form.save(commit=False)
            new_entry.author = request.user
            new_entry.save()
            return JsonResponse({
                'success': True,
                'post': {
                    'id': new_entry.id,
                    'content': new_entry.content,
                    'author': new_entry.author.username,
                    'created_at': new_entry.created_at.isoformat()
                }
            })
        else:
            return JsonResponse({'success': False, 'error': form.errors})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})
def posts(request, scope, page):
    
    if scope == "all":
        entries = Post.objects.all()
    if scope == "following":
        entries = Post.objects.filter(author__in=request.user.following.all())
    posts, has_next, has_previous = paginate (entries, page)
    
    
    return JsonResponse ({'posts': [entry.serialize() for entry in posts], 
                          'page_number': page, 
                          'has_next': has_next, 
                          'has_previous': has_previous})

def profile (request, username):
    user = User.objects.get(username = username)
    user_profile = UserProfile.objects.get(user = user)
    user_posts = Post.objects.filter(author = user)

    return JsonResponse ({'following': user.following.count(),
                        'followers': user.followers.count(),
                        'profile': user_profile.serialize(),
                        'posts': [entry.serialize() for entry in user_posts]})
    
def paginate (posts, index):
    
    posts = posts.order_by('-created_at').all()
    paginator = Paginator (posts, MAX_POSTS)
    current = paginator.page(index)
    entries = current.object_list
    has_next, has_previous = current.has_next(), current.has_previous()
    
    return entries, has_next, has_previous