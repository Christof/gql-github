import { GraphQLFacade } from "../src/graphql_facade";

describe("GraphQLFacade", function() {
  let facade: GraphQLFacade;
  const clientQueryMock = jest.fn<any>();
  const query = `
      query {
        viewer {
          login
          avatarUrl
        }
      }`;
  const variables = undefined;
  const retries = 1;
  const retryWaitSeconds = 0.001;

  beforeEach(function() {
    clientQueryMock.mockReset();
    facade = new GraphQLFacade({ query: clientQueryMock } as any);
  });

  it("returns data member of response", async () => {
    clientQueryMock.mockReturnValueOnce({
      data: "some data"
    });

    const user = await facade.query(
      query,
      variables,
      retries,
      retryWaitSeconds
    );

    expect(clientQueryMock).toHaveBeenCalledTimes(1);
    expect(user).toEqual("some data");
  });

  describe("retry", function() {
    it("retries once if gql query fails", async () => {
      clientQueryMock.mockReturnValueOnce({ errors: ["some error"] });
      clientQueryMock.mockReturnValueOnce({
        data: "some data"
      });

      const user = await facade.query(
        query,
        variables,
        retries,
        retryWaitSeconds
      );

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
      expect(user).toEqual("some data");
    });

    it("fails if retry also fails", async () => {
      clientQueryMock.mockReturnValue({ errors: ["some error"] });

      await expect(
        facade.query(query, variables, retries, retryWaitSeconds)
      ).rejects.toEqual(["some error"]);

      expect(clientQueryMock).toHaveBeenCalledTimes(2);
    });
  });
});
