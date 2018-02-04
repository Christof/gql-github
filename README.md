# gql-github

Tool to generate stats about contribution data from [github](github.com).
It is also able to generate release notes and retrieve them.

# Installation and building

```bash
yarn
yarn run tsc-watch
```

# Web-Server

The development server can be started by executing:

```
yarn run start
```

# Auth-Server

To access GitHub from the web app authentication requires to run a local server:

```
node server.js --port=7000 --host=localhost --client-id=... --client-secret=.... --origin="http://localhost:3000"
```

