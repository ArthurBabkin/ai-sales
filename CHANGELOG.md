# Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## 0.7.3
### Added:
- CRM system to the admin panel
### Updated:
- Prompt construction with respect to users existing in CRM
### Commits:
- Crm [`#31`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/31)

## 0.7.2
### Added:
- Leader board command to the telegram bot to display best sellers 
### Commits:
- Leaderboard [`#30`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/30)

## 0.7.1
### Added:
- Settings section to admin panel
- Controllable response delay to the bot
- Control over responses to commands
- Control over vector DB fetching configurations
### Commits:
- Configurations [`#27`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/27)
- Delay function. [`#26`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/26)

## 0.7.0
### Added:
- Admin panel option to edit all prompts
### Updated:
- Products changed to items
### Removed:
- Default trigger "I want to buy"
- All smart TV specific configurations 
### Commits:
- Genericity [`#25`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/25)

## 0.6.1
### Added:
- Prompt construction based on results from vector database
### Commits:
- Prompt construction [`#20`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/20)

## 0.6.0
### Added:
- Vector database for searching products
### Commits:
- Connected pinecone db to the bot and writed new function to get 3 top nearest... [`#19`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/19)
- Vector db [`#18`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/18)

## 0.5.2
### Added:
- CI Pipeline
- Unit tests
- Linting
### Commits:
- Refactoring [`#17`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/17)

## 0.5.1
### Updated:
- Fix admin panel functionality
### Commits:
- Return prompt panel [`#16`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/16)

## 0.5.0
### Added:
- Records of sellers activities
### Commits:
- End of sprint 4 pull request [`#13`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/13)

## 0.4.1
### Updated:
- Design to admin panel
### Commits:
- Frontend [`#14`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/14)

## 0.4.0
### Added:
- Telegram bot for managers
### Commits:
- Telegram integration [`#12`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/12)

## 0.3.1
### Added:
- Automatic deletion of outdated data to the database
### Updated:
- Prompt construction in classifier API call
### Commits:
- adapt classifier prompt to new database scheme [`#11`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/11)

## 0.3.0
### Added:
- Reminder mechanism to bot
### Commits:
- Bot reminder [`#10`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/10)

## 0.2.1
### Added:
- Dockerfile
### Commits:
- update Dockerfile [`#9`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/9)

## 0.2.0
### Added:
- Option to edit system prompt from Admin Panel
### Commits:
- make system prompt editable from admin panel [`#8`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/8)

## 0.1.0
### Added:
- Intent mechanism 
- Control over intents via admin panel
### Commits:
- Telegram integration [`#7`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/7)
- Return admin panel [`#6`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/6)
- Prompt engineering [`#5`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/5)

## 0.0.1
### Added:
- WhatsApp bot with LLM on backend
- Admin Panel
### Commits:
- update .gitignore & fix safety issue with Gemini API [`#4`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/4)
- Create MVP [`#1`](https://gitlab.pg.innopolis.university/n.zagainov/ai-sales/merge_requests/1)
