# Use an official Node.js runtime as a parent image
FROM node:23-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install

# Copy the rest of the app code
COPY . .

# Set build-time environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app
RUN npm run build

# Install only production dependencies
RUN npm ci --omit=dev

# Use a minimal runtime image
FROM node:23-alpine

# Add dependencies for Trivy installation
RUN apk add --no-cache curl ca-certificates tar

# Install Trivy using the official script
# Using a specific version for stability, update if necessary
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.52.2

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
