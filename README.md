

<div style="background: #F1F5F9;" align="center"><br>
<img src="network/static/network/wave.png" alt="Logo" width="80" height="80">
</div>

<h3 align="center">Chime In!</h3>

A dynamic [social networking platform](https://cs50.harvard.edu/web/2020/projects/4/network/) built with Django and JavaScript.
Features include real-time post interactions, image sharing, user following system, and threaded comments.
Implements asynchronous updates for likes and follows using Fetch API.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Features](#features)
- [Technologies](#technologies)
- [Roadmap](#roadmap)
- [Project Structure](#project-structure)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Installation

To set up this project on your computer:

1. Clone this project and navigate

   ```
   git clone https://github.com/httpvieve/network.git
   ```

2. Set up environment and install all necessary dependencies

   ```
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Make migrations then migrate
   ```
   python manage.py makemigrations network
   python manage.py migrate
   ```
3. Create admin superuser
   ```
   python manage.py createsuperuser
   ```
4. Run the development server
   ```
   python manage.py runserver
   ```

## Features

**User Profiles**
- Profile customization
- Follow/unfollow system
- User statistics (followers/following counts)


**Posts and Interactions**

- Create posts with image upload support
- Real-time like/unlike functionality
- Threaded comments on posts
- Edit post capabilities

**Feed System**

- All posts feed
- Following-only feed
- Paginated post display
- Dynamic content loading

**Real-time Updates**

- Asynchronous post updates
- Live interaction counters
- Dynamic content rendering


## Technologies

- **Django**
- **JavaScript**
- **Fetch API**
- **TailwindCSS**

## Roadmap

**Completed ✓**

- [x] User Authentication
- [x] Profile Management
- [x] Post Creation & Editing
- [x] Follow System
- [x] Like System
- [x] Comment Threads
- [x] Image Uploads
- [x] Feed Pagination
- [x] Real-time Updates

## Project Structure

```
    network/
├── network/                    # Main application directory
│   ├── models.py              # Database models
│   ├── views.py               # View controllers
│   ├── static/                # Static files
│   │   └── network/
│   │       └── component.js   # Frontend JavaScript
│   └── templates/             # HTML templates
│
├── project4/                  # Project configuration
│   ├── settings.py           # Project settings
│   └── urls.py               # URL routing
│
└── manage.py                 # Django management script

```

## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.

## Acknowledgments

- [Django Documentation](https://docs.djangoproject.com/en/5.1/)
- [CS50’s Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/2020/)
