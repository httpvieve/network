FROM python:3.12.2-slim-bullseye

ENV PYTHONUNBUFFERED=1

ENV PORT=8080

WORKDIR /app

COPY . /app/

RUN pip install --upgrade pip && pip install -r requirements.txt

CMD gunicorn project4.wsgi:application --bind 0.0.0.0:"${PORT}"

EXPOSE ${PORT}
