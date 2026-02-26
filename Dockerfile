# We use 'slim' to keep the image small and stealthy
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
# This happens before copying code to make builds faster (caching)
COPY package*.json ./
RUN npm install --production

# Copy all your proxy files and folders (including 'public')
COPY . .

# Your server.js uses port 3000, so we tell the container to open it
EXPOSE 3000

# Start the game-engine-server
CMD ["npm", "start"]
