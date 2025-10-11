# reflex
This is an application to help gamers improve their hand-eye coordination for games like First Person Shooters (FPSs) with a variety of mini-games. Some games include an Aim Trainer, a reaction time test, and a tracker game. Software Engineering Term Project for CEN 3031, Fall 2025.




How to Set up Database Locally: 

Step 1: Install Depdencies
- npm install

Step 2: Create the local database via pgAdmin
- I called my "ReflexDB"

Step 3: Create the .env file 
- With connection string: DATABASE_URL="postgresql://username:password@localhost:5432/project_name?schema=public"


Step 4: Run migrations to build the schema 
- npx prisma migrate dev

Step 5: Confirm everything works
- npx prisma studio
