TECNOLOGIAS USADAS:
NextJS, React, Prisma, Next-Auth, TailwindCSS e ShadCN.


REQUISITO:
Nodejs maior ou igual 18.


CONTEXTO:

Banco de dados está no prisma -> encomp.db (SQLite) 

Há a minha conta e também a do "eduardo":
Senha: Edu@rdo123

A minha senha: Th@lesHenrique123


TUTORIAL DE COMO RODAR:

digite isso no terminal

npm i

criar o arquivo das variáveis do ambiente.
.env.local -> fica dentro da pasta encomp mesmo, no topo.
Inserir essa chave no arquivo:

NEXT_PUBLIC_AUTH_SECRET=7CF9D8YyG3dntTj8gcQihu9QCqGnvyT8

após isso volte ao terminal e digite:

npm run dev

ir no site localhost:3000


ROTAS:

login -> localhost:3000/auth/login
cadastro -> localhost:3000/auth/signup
home -> localhost:3000
