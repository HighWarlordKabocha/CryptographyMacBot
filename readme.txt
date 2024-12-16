*** This is a draft ***

KABOCHA BOT

A Discord bot designed to expose users to aspects of cybersecurity through engaging quests and cryptography challenges. This bot includes features such as /quest for custom challenges and /cryptography for automated cryptography tasks.

FEATURES

Quests: Present users with scenarios requiring analytical and cybersecurity skills.

Cryptography Challenges: Generate random encoded messages for users to decode.

Leaderboards: Track user progress and showcase top performers.

PREREQUISITES

Before you can run this bot, ensure you have the following:

Node.js: Version 16.9.0 or newer.

npm: Included with Node.js.

A Discord Bot Token: Create a bot on the Discord Developer Portal.

Git (optional): To clone the repository.

SETUP INSTRUCTIONS

Clone the Repository

git clone https://github.com/username/repository-name.git
cd repository-name

Install Dependencies

npm install

Create a .env File
Create a .env file in the root directory of the project and add the following:

BOT_TOKEN=your-bot-token
CLIENT_ID=your-client-id
GUILD_ID=your-guild-id

Replace your-bot-token, your-client-id, and your-guild-id with the respective values from the Discord Developer Portal.

Start the Bot

node index.js

Deploy Commands
If commands are not appearing in Discord, deploy them:

node deploy-commands.js

BOT COMMANDS

/quest

Scenario: Presents the current quest scenario.

Answer: Submits an answer to the current quest.

Leaderboard: Displays the quest leaderboard.

Tip: Provides a hint for the quest.

/cryptography

Question: Presents a random cryptography challenge.

Answer: Submits a decoded answer to the challenge.

Stats: Shows the user's cryptography stats.

CONTRIBUTING

Contributions are welcome! To contribute:

Fork the repository.

Create a feature branch:

git checkout -b feature-name

Commit your changes:

git commit -m "Add a new feature"

Push to the branch:

git push origin feature-name

Create a Pull Request.

SECURITY

If you discover a security vulnerability, please open an issue or contact the repository owner directly.

LICENSE

Copyright (c) 2024 H. W. Kabocha

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

ACKNOWLEDGEMENTS
