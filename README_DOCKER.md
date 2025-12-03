Docker development setup for this React + Flask project

Overview
- Frontend: Vite + React (runs on port 5173)
- Backend: Flask (runs on port 5000)

Prérequis :
- Docker & docker-compose (ou Docker Desktop)
- Node 18/22 (si dev local), Python 3.11 (si dev local)


1) Première fois (ou après changement de dépendances / Dockerfile) :
   docker compose up --build
2) Démarrer rapidement (si l'image existe) :
   docker compose up
3) Arrêter et nettoyer :
   docker compose down

npm install vs npm ci ?
- npm install  : ajout / maj d'une dépendance localement (puis committer package.json + package-lock.json).
- npm ci       : après git clone / git pull si package.json ou package-lock.json a changé (ou dans CI/Docker). Installe exactement ce qui est dans package-lock.json.


Quand rebuild Docker ?
- Rebuild si tu as modifié :
  - Dockerfile(s)
  - package-lock.json / package.json
  - requirements.txt
- Si tu n’as changé que du code source et que tu utilises volumes dans docker-compose, tu n’as pas besoin de rebuild


docker compose up --build : 
Use first time when we use the stack. If we changed a Dockerfile or modified package-lock.json, requirements.txt and we wanted the image to be rebuild. 

docker compose up --build   # build + démarre
docker compose up            # démarre en réutilisant les images existantes
docker compose down          # stop et cleanup

commandes utiles : 
# build + start (first time or after deps changes)
docker compose up --build -d

# start when images exist
docker compose up -d

# follow backend logs
docker compose logs -f backend

# restart only backend
docker compose restart backend

# stop (keeps containers)
docker compose stop

# stop & remove containers + network (keeps volumes)
docker compose down

# stop & remove containers + network + volumes (DESTROY data)
docker compose down --volumes