import { assertType, expect, test } from "vitest";
import { NotionDB, date, select, text, title } from "./notionDb.js";
import { createNotionDb } from './createNotionDb.js'
import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
  notionVersion: "2025-09-03",
});

test("create database", async () => {
  const schema = {
    title: title(),
  }
  const db = await createNotionDb({
    client: notionClient,
    parentId: "1ab79b5bd2da8001a83cc6032e6a3441",
    parentType: "page",
    name: "new database",
    schema
  })

  expect(db.databaseId).toBeTruthy()
  expect(db.databaseName).toEqual("new database")
  await db.insert({
    title: "hello world"
  })
  const notionDB = await NotionDB.create({
    client: notionClient,
    databaseId: db.databaseId,
    schema,
  })

  const result = await notionDB.findAll()

  expect(result).toEqual(
    expect.arrayContaining([{ title: "hello world" }])
  )
  assertType<NotionDB<typeof schema>>(db)
}, 20_000);

//improve test checking
//make title mandatory in schema
