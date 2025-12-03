#Version of node i use. Apparently, the alpine is less heavy.
FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
#Use the first one, if it's not working, it will npm i instead.
RUN npm ci --silent || npm install --silent

# Copy source
COPY . .
#Localhost vite
EXPOSE 5173
#This means, if you use npm it will be with run, dev, --, --host. 
#Means --host will be received by Vite
CMD ["npm", "run", "dev", "--", "--host"]
