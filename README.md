# reflex
This is an application to help gamers improve their hand-eye coordination for games like First Person Shooters (FPSs) with a variety of mini-games. Some games include an Aim Trainer, a reaction time test, and a tracker game. Software Engineering Term Project for CEN 3031, Fall 2025.


Steps to run WebServer:
- clone repo using "git clone https://github.com/rambomario15/reflex"
- cd into /reflex/backend
- run "npm install" to download all dependencies
- create .env file inside /backend/prisma
    - should be at the same level as schema.prisma
- in the .env file, add the following string:
    - DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ReflexDB?schema=public"
    - replace user with your username (default should be postgres)
    - replace password with your password
    - the database should be called ReflexDB, if not change to whatever you named it to be
- run "npx prisma generate"
- run "npx prisma migrate deploy"
- now you should be able to run "node index.js" to start the server
- open a new terminal, and cd into /frontend
- run "npm install"
- run "npm start"