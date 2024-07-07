# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

# Set environemntal variables.
ENV ID_INSTANCE="1103944893"
ENV API_TOKEN_INSTANCE="18ff1495b27f40d1ad5daa5561a8362a19b8355b3ded4ad9a9"
ENV API_KEY="AIzaSyA3F_W3kRoR3IRKIHMuo02Dr_o_76YzUtE"
ENV AUTH_DOMAIN="ai-sales-92cf4.firebaseapp.com"
ENV PROJECT_ID="ai-sales-92cf4"
ENV STORAGE_BUCKET="ai-sales-92cf4.appspot.com"
ENV MESSAGING_SENDER_ID="280924767535"
ENV APP_ID="1:280924767535:web:92f69b40871ce79e86cdda"
ENV MEASUREMENT_ID="G-K60EZ3E2FV"
ENV DATABASE_URL="https://ai-sales-92cf4-default-rtdb.europe-west1.firebasedatabase.app/"
ENV PORT=8000
ENV GEMINI_TOKEN="AIzaSyAzVjh5M1zT7bpWjIk4HMqTXrVTtkQeXEI"
ENV GEMINI_MODEL="gemini-1.0-pro"
ENV EMBEDDING_MODEL="embedding-001"
ENV PROXY_URL="http://35.185.196.38:3128"
ENV TELEGRAM_TOKEN="7353675669:AAEZKrLT6YoiQHMVghnwlFFajX73mYEmC3k"
ENV PINECONE_TOKEN="3946b0ce-4c5b-4a32-9015-214b6c6e4f53"

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD npm run start
