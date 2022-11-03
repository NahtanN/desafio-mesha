<h1 align="center">Desafio Mesha (Guia)</h1>

## Comece clonando o projeto

```bash
$ git clone https://github.com/NahtanN/desafio-mesha
```

## Instale as dependências

```bash
$ yarn
```

## Rode o projeto em desenvolvimento

```bash
# watch mode
$ yarn start:dev
```

  <details>
      <summary><strong>Para mais detalhes</strong></summary>
      <p>Esse comando será responsável por orquestrar todo o seu ambiente de desenvolvimento. Ele executará os seguintes comandos</p>

```bash
# Instãncia um docker container e mantem em execução no background
$ services:up

# (services:up)
$ docker-compose -f infra/docker-compose.development.yml up -d
```

```bash
# Executa os camandos do Prisma
$ yarn prisma:dev:start

# (prisma:dev:start) Faz o deploy das Migrations e executa o comando de Seed do banco de dados
$ dotenv -e .env.development -- npx prisma migrate deploy && yarn prisma:dev:seed

# (prisma:dev:seed) Comando de Seed do banco de dados
$ dotenv -e .env.development -- npx prisma db seed
```

```bash
# Inicia o servidor em Watch Mode
$ dotenv -v NODE_ENV=development -e .env.development -- nest start --watch
```

</details>

<p>Após iniciar o servidor, a documentação com a descrição das rotas ficará disponível na rota <code>http://localhost:3001/docs</code>.</p>

## Testes

```bash
# Testes de integração
$ yarn test:int

# Testes e2e (Ponta a Ponta)
$ yarn test:e2e
```

## Util

Caso esteja utilizando o [Insomnia](https://insomnia.rest/), você pode importar o arquivo na diretório [/insomnia](https://github.com/NahtanN/desafio-mesha/tree/master/insomnia).

Apos o servidor iniciar, execute o comando <code>yarn prisma:dev:studio</code> para utilizar a ferramente de visualização de banco de dados do Prisma.

Após o Seed do banco de dados você pode utilizar os seguintes casdastros para fazer login:

```bash
# Login como cliente
- (email) client1@test.com
- (senha) 123456

# Login como funcionário
- (email) employee1@test.com
- (senha) 123456
```
