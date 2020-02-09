django_vue_docker
-------------------

* Python 3.8
* Django 2.2


### 作成方法
```
pipenv install --python 3.8
pipenv shell
pipenv install django django-rest-framework psycopg2-binary django-environ
django-admin startproject config .
touch .env Dockerfile docker-compose.yml
```
~~~:.env
DEBUG=0
SECRET_KEY=「YOUR SECRET KEY」
POSTGRES_NAME=docker
POSTGRES_USER=docker
POSTGRES_PASSWORD=password
POSTGRES_HOST=postgres
~~~

~~~python:settings.py
import environ

env = environ.Env()
env.read_env('.env')

DEBUG = env.get_value('DEBUG')
SECRET_KEY = env.get_value('SECRET_KEY')

POSTGRES_NAME = env.get_value('POSTGRES_NAME')
POSTGRES_USER = env.get_value('POSTGRES_USER')
POSTGRES_PASSWORD = env.get_value('POSTGRES_PASSWORD')
POSTGRES_HOST = env.get_value('POSTGRES_HOST')

ALLOWED_HOSTS = ['0.0.0.0']

...

LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': POSTGRES_NAME,
        'USER': POSTGRES_USER,
        'PASSWORD': POSTGRES_PASSWORD,
        'HOST': POSTGRES_HOST
    }
}
~~~

~~~
python manage.py startapp [YOUR APP NAME]
bash -c "mkdir -p templates/app && touch templates/app/index.html && app/urls.py"
~~~

~~~python:settings.py
INSTALLED_APPS = [
    ...
    'app.apps.MatchingConfig',
    'rest_framework',
]

...

TEMPLATES = [
    'DIRS': [os.path.join(BASE_DIR, 'templates')],
]
~~~

~~~html:templates/app/index.html
{{ message }}
~~~

~~~python:app/views.py
from django.shortcuts import render
from django.views.generic import TemplateView

class IndexView(TemplateView):
    template_name = 'app/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['message'] = 'Hello World!!'
        return context
~~~

~~~python:config/urls.py
from django.conf.urls import include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
]
~~~

~~~python:app/urls.py
from django.urls import path
from django.conf import settings

from .views import IndexView

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
]
~~~

~~~:Dockerfile
FROM python:3.8.0

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app
COPY Pipfile Pipfile.lock /app/
RUN pip install --upgrade pip && pip install pipenv && pipenv install --system --ignore-pipfile
COPY . /app/
~~~

~~~:docker-compose.yml
version: "3.7"

services:
  django:
    build:
      context: .
      dockerfile: Dockerfile
    command: "python /app/manage.py runserver 0.0.0.0:8080"
    volumes:
      - .:/app
    ports:
      - "8080:8080"
    env_file: .env
    links:
      - postgres

  postgres:
    image: postgres:11
    ports:
        - "5432:5432"
    environment:
      POSTGRES_DB: docker
      POSTGRES_USER: docker
      POSTGRES_PASSWORD: password
~~~

### 環境構築
```
git clone https://github.com/gamogamola/django_vue_docker.git
cd django_vue_docker
pipenv install --python 3.8
touch .env
```

```
docker-compose up -d
docker-compose exec django python manage.py createsuperuser
docker-compose exec django python manage.py migrate
```

### モデル作成
```
docker-compose exec django python manage.py makemigrations
```

#### デバッグ
* コンテナへ入る
    - docker exec -i -t django_vue_docker_django_1 bash
* 新しいメソッドの実行結果確認
    - Djangoではmanage.py shellで実装したメソッドなどが試せる
    `$ docker-compose exec django ./manage.py shell` でコンテナに入り、`メソッド名`を実行
* 動作がおかしい時
```
docker-compose restart
```

static/
npm run buildした時に作られるimg,css,jsを格納