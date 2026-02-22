# notionDb

A small typed wrapper around the Notion API for inserting and querying rows with a schema.

This package targets Notion API version `2025-09-03` (multi-source databases). In this API version, most “database operations” require a **data source id**.

## Setup

- Create a Notion integration and copy its token.
- Share the target database (and any parent pages used for creation) with the integration.

When using `@notionhq/client` v5+, explicitly set the API version:

```ts
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: "2025-09-03",
});
```

## Usage

### Connect to an existing database

Use `NotionDB.create(...)` to **discover the correct `data_source_id`** from a `databaseId`.

```ts
import { NotionDB, title, text, select, date } from "./src/notionDb.js";

const schema = {
  Name: title(),
  summary: text(),
  whitespace: select(["hello", "world"]),
  birthday: date(),
};

const db = await NotionDB.create({
  client: notion,
  databaseId: "<your database id>",
  schema,
});

await db.insert({
  Name: "Hello World",
  summary: "A summary",
  whitespace: "hello",
  birthday: new Date("1997-07-25"),
});

const rows = await db.findAll();
console.log(rows);
```

### Create a new database under a page

```ts
import { createNotionDb } from "./src/createNotionDb.js";
import { title } from "./src/notionDb.js";

const schema = {
  title: title(),
};

const db = await createNotionDb({
  client: notion,
  parentType: "page",
  parentId: "<page id>",
  name: "new database",
  schema,
});

await db.insert({ title: "hello world" });
```

## Notes / troubleshooting

- `object_not_found`: the database/page likely isn’t shared with the integration.
- If you already know the `data_source_id`, you can construct directly:

```ts
import { NotionDB, title } from "./src/notionDb.js";

const db = new NotionDB({
  client: notion,
  databaseId: "<database id>",
  dataSourceId: "<data source id>",
  schema: { Name: title() },
});
```
