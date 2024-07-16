[![MIT License][license-shield]][license-url]

<h1 align="center">AI Sales</h1>
WhatsApp AI Assistant configurable for your needs

## About

This project is a WhatsApp AI Assistant configurable for your needs. It allows you to create a personalized AI chatbot for your business. The Service is set to use a language model on backend of WhatsApp chatbot and be configurable from Admin Panel. It also has a Telegram bot for managers, a CRM system, an option to edit all prompts, vector database for searching items, prompt construction based on results from vector database, automatic deletion of outdated data to the database, Prompt construction based on results from vector database, Reminder mechanism to bot, and more.

## Core Features
The project consists of 3 services: 

### WhatsApp Bot
The bot is used to communicate with clients, consult them on basic questions about your business, and report on predefined set of cases to the backend

### Admin Panel
The panel is used to configure the bot's behavior. Specifically:
* Basic instructions in form of natural language
* Items representing elements on which users ask questions
* Scenarios to report to backend
* Other configurations

### Telegram Bot
The bot can be added to group or channel, and it will report on activations of triggers described above. Managers who serve triggered clients are stored in leader board that can later be viewed to check who did what

## Demo
[The video](https://youtu.be/88xfGmy9_Xc?si=CppCALhMcOMEMb4H) with demo of basic functionality.

## Deployed version
WhatsApp bot is running on account +7 (964)-860-22-14
Admin Panel can be accessed [here](https://ai-sales-ehzu.onrender.com)
Telegram bot can be accessed [here](https://t.me/ai_sales_assistant_bot)

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
* Go to [Pinecone](https://app.pinecone.io/), create new index named `ai-sales` with 768 dimensions and cosine similarity criterion, add your API token to `.env`
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

## How to use
### Admin Panel
* Edit `src/admin-panel/add-admin.js and run 
```
npm run add-admin
```
to add new authorization to admin panel
* Go to port your host (if running locally, `http://localhost:<YOUR_PORT>/`)
* Configure System prompts for definition of behavior, intent detection, and reminder
* Create new intents (e. g: "I want to buy", "I want to speak to the manager")
* Optionally, add items on which your bot will assist users

### WhatsApp Bot
* Go to the chat with your bot
* Test your configurations

### Telegram Bot
* To add trigger activation tracking, add telegram bot to the group of choice and type `/set_group`
* Bot will stream activated triggers to this group and manage services made by admins

## Frameworks & Technologies
* [Node.js](https://nodejs.org/en)
* [Express.js](https://expressjs.com)
* [Telegraf.js](https://telegraf.js.org)
* [Green API](https://green-api.com)
* [Gemini API](https://aistudio.google.com/app/)
* [Firebase](https://console.firebase.google.com)
* [Pinecone](https://app.pinecone.io/)

[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/-/blob/main/LICENSE?ref_type=heads
