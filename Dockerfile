# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Set working directory
WORKDIR /home/node/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Set environmental variables
ENV ID_INSTANCE="1103946695"
ENV API_TOKEN_INSTANCE="b406697e42b84bd8b412f4a56cb7e791b6fc574055e04955a8"
ENV API_KEY="AIzaSyA3F_W3kRoR3IRKIHMuo02Dr_o_76YzUtE"
ENV AUTH_DOMAIN="ai-sales-92cf4.firebaseapp.com"
ENV PROJECT_ID="ai-sales-92cf4"
ENV STORAGE_BUCKET="ai-sales-92cf4.appspot.com"
ENV MESSAGING_SENDER_ID="280924767535"
ENV APP_ID="1:280924767535:web:92f69b40871ce79e86cdda"
ENV MEASUREMENT_ID="G-K60EZ3E2FV"
ENV DATABASE_URL="https://ai-sales-92cf4-default-rtdb.europe-west1.firebasedatabase.app/"
ENV TELEGRAM_TOKEN="7415920476:AAHY9ligor15DUGL2rKv1240wn_-8k7Ctvs"
ENV DEEPSEEK_TOKEN="sk-0441f3e4c485454dbd7c60d38c8bf34e"
ENV LLM_NAME="deepseek-chat"
ENV LLM_URL="https://api.deepseek.com/chat/completions"
ENV PORT=8000

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD ["npm", "run", "start"]
