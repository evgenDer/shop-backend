export const formatJSONResponse = (response: Record<string, unknown> | Array<Record<string, unknown>> | string, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(response),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};