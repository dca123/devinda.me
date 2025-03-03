import { expect, test } from "vitest";
import { NotionDB, date, select, text, title } from "./notionDb.js";
import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
});

test("inserts title to page", async () => {
  const client = new NotionDB({
    client: notionClient,
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      Name: title(),
    },
  });
  const name = "Hello World";
  const response = await client.insert({
    Name: name,
  });

  expect(response.properties.Name.title[0].plain_text).toEqual(name);
});

test("inserts string to page", async () => {
  const client = new NotionDB({
    client: notionClient,
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      summary: text(),
    },
  });

  const summary = "Hello, here is a summary";
  const response = await client.insert({
    summary,
  });

  expect(response.properties.summary.rich_text[0].plain_text).toEqual(summary);
});

test("inserts select to page", async () => {
  const client = new NotionDB({
    client: notionClient,
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      whitespace: select(["hello", "world"]),
    },
  });

  const response = await client.insert({
    whitespace: "hello",
  });

  expect(response.properties.whitespace.select.name).toEqual("hello");
});

test("inserts date to page", async () => {
  const client = new NotionDB({
    client: notionClient,
    databaseId: "2a93636c71494fe88f3f810fcb0be6cf",
    schema: {
      birthday: date(),
    },
  });

  const myBirthday = new Date("1997-07-25");
  const response = await client.insert({
    birthday: myBirthday,
  });

  expect(Date.parse(response.properties.birthday.date.start)).toEqual(
    myBirthday.getTime(),
  );
});

test("findAll", async () => {
  const client = new NotionDB({
    client: notionClient,
    databaseId: "2a4cbc8d46d34b508c5ac30897394140",
    schema: {
      Name: title(),
      fav_food: text(),
    },
  });

  const response = await client.findAll();
  expect(response).toEqual(
    expect.arrayContaining([
      {
        Name: "Devinda",
        fav_food: "Pizza",
      },
      {
        Name: "Minesh",
        fav_food: "Beer",
      },
    ]),
  );
});
