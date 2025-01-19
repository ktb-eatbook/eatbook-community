# Eatbook Community  

<div>
  <img width="125" height="125" src="https://github.com/user-attachments/assets/3d0a2b45-d5a8-40e0-b055-5caf6e9d2e36">  
</div>  

<div>
  <a href="https://play.google.com/store/apps/details?id=com.eatbook.eatbook_app&pli=1"><img src="https://img.shields.io/badge/Google Play-Download%2B-orange.svg?style=flat"></a>
</div>


>Eatbook 사용자가 소설 등록 요청을 할 수 있도록 하기 위한 서비스 입니다.  

markdown에 관한 내용은 다음을 통해 확인할 수 있습니다.  

  - Markdown Content: [ktb-eatbook/eatbook-community/ERD.md](https://github.com/ktb-eatbook/eatbook-community/blob/master/ERD.md)
  - Prisma Schema: [ktb-eatbook/eatbook-community/schema.prisma](https://github.com/ktb-eatbook/eatbook-community/blob/master/prisma/schema.prisma)  


[![Example Case](https://github.com/user-attachments/assets/7a51727d-90d6-49a7-b2f4-fce956099a8f)](https://github.com/ktb-eatbook/eatbook-community/blob/master/ERD.md)  
  
   




## Setup  

### 환경  

>NodeJS v20.18.0 Postgresql v17.2.0

### 설치  

종속성 모듈을 설치합니다.  

```bash
npm install
```  

정의된 Prisma schema를 DB와 동기화 합니다.

```prisma
npx prisma generate  
npx prisma db push
```  

스웨거를 생성합니다.  

```bash
mkdir swagger
npx nestia swagger
```

개발 모드로 서버를 실행합니다.

```bash
npm run start:dev
```  

Production 모드로 서버를 실행합니다.

```bash
npm build  
npm run start:prod
```