# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application
RUN npm run build

# Install serve to serve the static built application
RUN npm install -g serve

# Expose port used by serve
EXPOSE 3000

# Command to run the frontend
CMD ["serve", "-s", "dist", "-l", "3000"]
