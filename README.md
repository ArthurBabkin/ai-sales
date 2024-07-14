
# AI Sales

## Project Description
AI Sales is an innovative project that leverages AI to interact with buyers using the Gemini API. The bot is designed to handle sales queries and transactions efficiently. The backend logic is implemented using JavaScript, with data stored in a Firebase database and the entire application containerized using Docker.

## Demo
Check out our demo video to see AI Sales in action:
[Watch Demo](https://www.youtube.com/watch?v=88xfGmy9_Xc)

## How to Use
1. **Access the Application**: Navigate to the web interface where the AI Sales bot is hosted.
2. **Interact with the Bot**: Type your sales-related queries or requests in the chat interface.
3. **Receive Responses**: The bot will process your input using the Gemini API and provide accurate and helpful responses.## How to Use
1. **Access the Application**: Navigate to the web interface where the AI Sales bot is hosted.
2. **Interact with the Bot**: Type your sales-related queries or requests in the chat interface.
3. **Receive Responses**: The bot will process your input using the Gemini API and provide accurate and helpful responses.
The dev bot can be accessed on WhatsApp: `+7 961 337-99-19`\
Configuration to access Bot via Green API:
```
ID_INSTANCE="1103946695"
API_TOKEN_INSTANCE="b406697e42b84bd8b412f4a56cb7e791b6fc574055e04955a8"
```
## Features
- **AI-Powered Interactions**: Responds to buyer queries in real-time using advanced AI algorithms.
- **Integration with Gemini API**: Utilizes the Gemini API for robust and reliable sales data handling.
- **JavaScript Backend**: Efficient backend logic implemented in JavaScript.
- **Firebase Database**: Secure and scalable data storage solution.
- **Docker Containerization**: Ensures seamless deployment and scalability of the application.



## Project Installation / Deployment
To set up and run the AI Sales project locally, follow these steps:

### Prerequisites
- Node.js
- Docker
- Firebase Account

### Installation Steps
1. **Clone the Repository**
    ```bash
    git clone https://github.com/username/aisales.git
    cd aisales
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Set Up system**
   ## Firebase
The project uses [firebase](https://console.firebase.google.com/project/ai-sales-92cf4/overview) realtime database. Use the following firebase configuration for access:
```
API_KEY="AIzaSyA3F_W3kRoR3IRKIHMuo02Dr_o_76YzUtE"
AUTH_DOMAIN="ai-sales-92cf4.firebaseapp.com"
PROJECT_ID="ai-sales-92cf4"
STORAGE_BUCKET="ai-sales-92cf4.appspot.com"
MESSAGING_SENDER_ID="280924767535"
APP_ID="1:280924767535:web:92f69b40871ce79e86cdda"
MEASUREMENT_ID="G-K60EZ3E2FV"
DATABASE_URL="https://ai-sales-92cf4-default-rtdb.europe-west1.firebasedatabase.app/"
```

## Gemini
The WhatsApp bot is powered by Gemini. To set up, visit [Google AI studio](https://aistudio.google.com/app/) (VPN required) and generate new API key. Set environmental variables 
```
GEMINI_TOKEN=<your-api-key> 
GEMINI_MODEL="gemini-1.0-pro"
``` 
Gemini is inaccessible from Russia, proxy is required to run bot, set environmental variable:
```
PROXY_URL="http://35.185.196.38:3128"
```
or use other proxy URL. Easy way to get working proxy URL quick is using python [free-proxy](https://pypi.org/project/free-proxy/) library

## Telegram bot
The dev bot can be accessed on telegram: [@ai_sales_assistant_bot](https://t.me/ai_sales_assistant_bot). Token for access:
```
TELEGRAM_TOKEN="7415920476:AAHY9ligor15DUGL2rKv1240wn_-8k7Ctvs"
```
6. **Access the Application**
    - Open your browser and go to `http://10.90.138.241:8080/` to start using AI Sales.

## Frameworks or Technology
- **JavaScript**: Used for backend logic.
- **Firebase**: Database for storing sales data.
- **Docker**: Containerization for easy deployment.
- **Gemini API**: For handling buyer interactions and transactions.

---