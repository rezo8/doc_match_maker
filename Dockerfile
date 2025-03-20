# Step 1: Use Node.js as the base image
FROM node:16 AS build

# Step 2: Set working directory in container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the TypeScript code
RUN npm run build

# Step 7: Expose the server port (e.g., 8080)
EXPOSE 8080

# Step 8: Set environment variable for production
ENV NODE_ENV=production

# Step 9: Install only production dependencies
RUN npm install --only=production

# Step 10: Start the app
CMD ["npm", "start"]

