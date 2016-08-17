Photogram 1.3
===================
### Sumário

[TOC]


# Aviso importante
Apesar desse projeto ter como base a versão 1.2, o código mudou muito, ficou mais organizado e caso você já tenha iniciado um outro projeto, aconselho a fazer uma versão utilizando a 1.3 e ir migrando aos poucos.

----------
## Notas da versão 1.3
É com grande prazer que apresento a nova versão do **Photogram**. 

Uma versão muito mais próxima do Instagram original, agora você tem um recurso para **capturar fotos, da camera ou galeria**, **cortar**, **aplicar filtro**  e até **compartilhar** depois de postar a foto tudo muito fácil de usar e com uma configuração bem simples.

Além disso, o código amadureceu também, agora estamos seguindo um padrão para códigos com **AngularJS**, que torna muito melhor de dar manutenção, entender, estudar e com mais reaproveitamento de código.

----------
# Vamos começar
Para começar é preciso que tenha um conhecimento mínimo de Ionic, aconselho a ver a documentação em:

> http://ionicframework.com/docs/

----------
## Clonando do Github

Primeiro faça o clone desse projeto para sua máquina usando o comando:

> git clone https://github.com/photogram/ionic-app-parse.git photogram

Depois digite o comando abaixo para instalar as dependências do Node e do bibliotecas do Bower 
> npm install

Para rodar o projeto no seu browser use o comando
> ionic serve 

## Comandos Importantes
Antes de começar esse projeto é bem diferente dos que você encontra na internet, peço que evite ao máximo editar o arquivo **www/index.html**,  você pode até estar estranhando, mas todo os arquivos que você criar ou editar na pasta www, e até instalar alguma nova biblioteca no bower, o Gulp tem um comando para atualizar sozinho o arquivo **index.html** do projeto.

Vamos conhecer alguns comandos

### gulp sass:inject
Esse comando, serve para vasculhar todos os arquivos de sass (.scss) na pasta www/js, e coloca-los automaticamente no arquivo principal de sass para ser compilados juntos.

### gulp sass
Esse comando já é do próprio Ionic, porém as vezes precisa rodar o comando anterior quando cria ou deleta um arquivo sass da pasta js

### gulp inject
Esse comando é um dos mais importantes, com ele você não precisa mais ficar editar o arquivo index.html do projeto. Esse comando coloca automaticamente as dependencias do bower, js e css no arquivo index.html sem adicionar os arquivos de testes que terminam com  *Spec.js

### gulp prettify
Esse comando é maravilho, serve simplesmente para formatar seu código, muito importante antes de fazer um commit é formatar para manter o padrão do projeto.

### gulp translate
Esse comando serve para vasculhar todos os arquivos js e html e procurar por itens a serem traduzidos, depois disso ele gera os arquivos para tradução na pasta **translate/** e uma tradução na pasta **www/js/app.translate.js** com as traduções em diferentes linguagens. 

Para saber mais acesse: https://angular-gettext.rocketeer.be/

### gulp 
Esse comando roda vários outros ao mesmo tempo, é responsável por organizar o projeto e identificar erro antes de compilar

### gulp prod
Comando muito importante antes de fazer o deploy, através do seu arquivo index.html, ele gera uma build na pasta dist/ com o projeto compactado em até 95%, é um absurdo em redução de tamanho e ao mesmo tempo ganho em perfomance.


## Como configurar 

### Como configurar o Parse?
O aplicativo usa o Parse.com como seu backend, ou seja, todo o banco de dados, fotos e analytics estão configurados no Parse. 

O jeito mais fácil de começar é criando uma conta no Parse.com, depois enviando seu email para ser transferido uma cópia do Photogram em branco, para que você possa fazer as modificações como preferir.

A segunda forma é seguindo a documentação, criando as "tabelas" no Parse.com e depois configurando as chaves no arquivo www/js/app.config.js

### Como configurar o Ionic Analytics?
Antes de configurar o Ionic Analytics, você precisa ter uma conta em:

> https://apps.ionic.io/apps

Depois você precisa digitar um comando para iniciar a aplicação com a integração com o Ionic Analytics, porém antes disso você precisa renomear com o nome do seu projeto os seguintes arquivos:
> nome da pasta com o nome do aplicativo ex: Photogram
> nome do aplicativo no arquivo package.json
> nome do aplicativo no arquivo bower.json

E só depois executar o comando no seu terminal para configurar

>ionic io init

E por último, des comentar a linha no arquivo **www/js/app.js**, para que seja ativado o Ionic Analytics.

> $ionicAnalytics.register();

### Como configurar o Facebook?
Em breve

## Deploy no Celular
Para fazer deploy no celular, você precisa primeiro adicionar uma plataforma e depois instalar os plugins no qual o javascript se conecta com os recurso nativos do aparelho

### Adicionando uma nova plataforma

Para adicionar uma plataforma iOS digite 

> ionic platform add ios

Para adicionar uma plataforma Android digite 

> ionic platform add android
> 
### Instalando Plugins
Copie e cole o seguintes comando no seu terminal
>ionic plugin add com.ionic.keyboard 
ionic plugin add cordova-plugin-camera 
ionic plugin add cordova-plugin-console 
ionic plugin add cordova-plugin-device 
ionic plugin add cordova-plugin-file 
ionic plugin add cordova-plugin-file-transfer 1.
ionic plugin add cordova-plugin-geolocation 
ionic plugin add cordova-plugin-imagepicker 
ionic plugin add cordova-plugin-inappbrowser 
ionic plugin add cordova-plugin-splashscreen 
ionic plugin add cordova-plugin-statusbar 
ionic plugin add cordova-plugin-whitelist 
ionic plugin add cordova-plugin-x-socialsharing 

### Instalando o plugin do Facebook

# Publicando para Android na Play Store

## Criando uma conta

## Gerando Certificado

## Fazendo o Deploy do projeto com segurança 

## Criando artes


# Publicando para iPhone na Apple Store

## Criando uma conta

## Gerando Certificado

## Fazendo o Deploy do projeto com segurança 

## Criando artes
