# Site da Wyter (wyter.com.br)

Site estático, publicado automaticamente no GitHub Pages a cada push na branch `main`.

## Onde editar
| O quê | Arquivo |
|---|---|
| Textos de cada página | `src/pages/*.html` |
| WhatsApp, e-mail, CNPJ, redes sociais, link do Person Finance | `src/config.json` |
| Menu (cabeçalho) e rodapé | `src/partials/header.html` e `footer.html` |
| Cores, fontes, espaçamentos | `src/static/css/site.css` |
| Logos, favicon, imagem de compartilhamento | `src/static/assets/` e `src/static/*.png` |

Regras: tudo em português; "Wyter" (nunca "Wytercon"); sem depoimentos, números de clientes, resultados ou certificações não confirmados; sem nomes de clientes.

Para testar localmente (precisa de Node.js): `node build.mjs` e abrir `dist/index.html`.
