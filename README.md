[![MIT License][license-shield]][license-url]

<h1 align="center">AI Sales</h1>
WhatsApp AI Assistant configurable for your needs

## About

This project is a WhatsApp AI Assistant configurable for your needs. It allows you to create a personalized AI chatbot for your business. The AI is trained using a language model and can be configured through an Admin Panel. It also has a Telegram bot for managers, a CRM system, an option to edit all prompts, vector database for searching products, prompt construction based on results from vector database, automatic deletion of outdated data to the database, Prompt construction based on results from vector database, Reminder mechanism to bot, and more.

## Getting Started
### Prerequisites 
* Clone repository
```
git clone https://gitlab.pg.innopolis.university/n.zagainov/ai-sales.git
```
* Go to working directory
* Install Requirements
```
npm ci
```
* Additional installation
```
npm install -g pm2
```
This is needed to run the project
### Environment
* Go to [Firebase console](https://console.firebase.google.com)
* Create new project or choose existing one
* In your project configurations, add firebase realtime database
* Create `.env` file and copy credentials from firebase console:
```python
API_KEY="YOUR_API_KEY"
AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
PROJECT_ID="YOUR_PROJECT_ID"
STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
APP_ID="YOUR_APP_ID"
MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
DATABASE_URL="YOUR_DATABASE_URL"
```
* Go to [Green API console](https://console.green-api.com/), create an instance for your bot
* Copy ID and API key to `.env`:
```python
ID_INSTANCE="YOUR_ID_INSTANCE"
API_TOKEN_INSTANCE="YOUR_API_TOKEN"
```
* Go to [Google AI Studio](https://aistudio.google.com/app/), generate API key and choose model (e. g. `gemini-1.0-pro`), paste configurations to `.env`:
```python
GEMINI_TOKEN="YOUR_API_TOKEN"
GEMINI_MODEL="gemini-1.0-pro" # replace if needed
EMBEDDING_MODEL="embedding-001" # replace if needed
```
* Add proxy to `.env` to workaround Gemini limitations:
```python
PROXY_URL="YOUR_PROXY_URL"
```
* Add telegram bot token to `.env`:
```python
TELEGRAM_TOKEN="YOUR_TELEGRAM_TOKEN"
```
* Go to [Pinecone](https://app.pinecone.io/), create new index with 768 dimensions and cosine similarity criterion, add your API token to `.env`
```python
PINECONE_TOKEN="YOUR_PINECONE_TOKEN"
```
* Set port for Admin Panel in `.env`
```python
PORT=8000 # change if needed
```

### Running the project
To run the project, type:
```
npm run start
```
This will run all the services: WhatsApp Bot, Admin Panel, Telegram Bot. To stop:
```
pm2 stop all
```


[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/-/blob/main/LICENSE?ref_type=heads
