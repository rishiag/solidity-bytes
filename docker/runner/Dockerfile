FROM node:18-bullseye

WORKDIR /app

# Create a non-root user
RUN useradd -m runner && chown -R runner:runner /app
USER runner

# Pre-install hardhat deps to speed up cold starts
COPY --chown=runner:runner package.json package-lock.json* ./
RUN npm ci --silent || npm i --silent

# Copy scripts
COPY --chown=runner:runner scripts/run-exercise.js scripts/validate-exercises.js ./scripts/

# Default command: show help
CMD ["node", "scripts/run-exercise.js", "--id", "state-uint-variable", "--solution", "--vv"]

