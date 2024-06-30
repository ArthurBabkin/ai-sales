# Project
AI Sales 

# Customer
Hamza Salem @enghamzasalem 

# Important information
The dev bot can be accessed on WhatsApp: `+7 961 337-99-19`\
Configuration to access Bot via Green API:
```
ID_INSTANCE="1103946695"
API_TOKEN_INSTANCE="b406697e42b84bd8b412f4a56cb7e791b6fc574055e04955a8"
```

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