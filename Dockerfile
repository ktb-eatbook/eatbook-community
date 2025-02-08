FROM node:20.18.0-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app/

# 필요한 패키지 설치
RUN apk update && \
    apk add --no-cache \
        nano \
        curl \
        git \
        redis \
        gettext \
        alpine-conf && \
    apk add --no-cache --virtual .build-deps \
        build-base && \
    apk add --no-cache \
        libc6-compat

# 로케일 설정
RUN echo "export LANG=en_US.UTF-8" >> /etc/profile && \
    echo "export LANGUAGE=en_US.UTF-8" >> /etc/profile && \
    echo "export LC_ALL=en_US.UTF-8" >> /etc/profile && \
    echo "export LANG=ko_KR.UTF-8" >> /etc/profile && \
    echo "export LANGUAGE=ko_KR.UTF-8" >> /etc/profile && \
    echo "export LC_ALL=ko_KR.UTF-8" >> /etc/profile && \
    source /etc/profile

# 환경 변수 설정
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LANG=ko_KR.UTF-8
ENV LC_ALL=ko_KR.UTF-8

# 프로젝트 파일 복사
COPY . .

# 애플리케이션 의존성 설치 및 빌드
RUN npm install
RUN npm run build