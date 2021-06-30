const { Client } = require('@notionhq/client');
require('dotenv').config()

const notion = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
  const databaseId = 'be3a6d5904fc4efa9deba5dbe71e572a';
  const response = await notion.databases.query({ database_id: databaseId });
  console.log(response);
})();