FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Expose host to allow connections from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
