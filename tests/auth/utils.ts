export const addAuthHeaders = (request: any, accessToken: string) =>
  request
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .timeout(2000);
