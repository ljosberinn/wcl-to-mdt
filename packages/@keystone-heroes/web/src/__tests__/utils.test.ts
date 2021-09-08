import { parseWCLUrl } from "../utils";

describe("parseWCLUrl", () => {
  test("fails given no url", () => {
    expect(parseWCLUrl("")).toMatchInlineSnapshot(`
      Object {
        "fightID": null,
        "reportID": null,
      }
    `);
  });

  test("fails given random url", () => {
    expect(parseWCLUrl("https://keystone-heroes.com")).toMatchInlineSnapshot(`
      Object {
        "fightID": null,
        "reportID": null,
      }
    `);
  });

  test("fails given incomplete url", () => {
    expect(parseWCLUrl("https://keystone-heroes")).toMatchInlineSnapshot(`
      Object {
        "fightID": null,
        "reportID": null,
      }
    `);
  });

  test("fails given invalid fight id", () => {
    expect(
      parseWCLUrl(
        "https://www.warcraftlogs.com/reports/aZ9y3jMctCqRvhKA#fight=kekw&type=damage-done"
      )
    ).toMatchInlineSnapshot(`
      Object {
        "fightID": null,
        "reportID": "aZ9y3jMctCqRvhKA",
      }
    `);
  });

  test("passes given general report url", () => {
    expect(parseWCLUrl("https://www.warcraftlogs.com/reports/aZ9y3jMctCqRvhKA"))
      .toMatchInlineSnapshot(`
      Object {
        "fightID": null,
        "reportID": "aZ9y3jMctCqRvhKA",
      }
    `);
  });

  test("passes given report url with fight id hash", () => {
    expect(
      parseWCLUrl(
        "https://www.warcraftlogs.com/reports/aZ9y3jMctCqRvhKA#fight=3"
      )
    ).toMatchInlineSnapshot(`
          Object {
            "fightID": "3",
            "reportID": "aZ9y3jMctCqRvhKA",
          }
      `);
  });

  test("passes given report url with fight id === last", () => {
    expect(
      parseWCLUrl(
        "https://www.warcraftlogs.com/reports/aZ9y3jMctCqRvhKA#fight=last"
      )
    ).toMatchInlineSnapshot(`
      Object {
        "fightID": "last",
        "reportID": "aZ9y3jMctCqRvhKA",
      }
    `);
  });
});
