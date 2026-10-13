// Netlify function: ai-recipe (STUB)
// Generates a custom recipe from allergen/age/preferences.
// Wire to an AI provider (free tier) by setting AI_API_KEY + implementing the call.
// Until then the app falls back to a friendly local suggestion.
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  // TODO: call AI provider here with a system prompt that forbids medical claims
  // and returns { name, ingredients[], steps[], note } as JSON.
  return { statusCode: 501, body: JSON.stringify({ error: 'AI not configured yet' }) };
}
