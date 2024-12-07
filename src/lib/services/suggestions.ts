import { Account } from '../types';

const SYSTEM_PROMPT = `Du bist ein Experte für Schweizer Buchhaltung. Basierend auf der Beschreibung des Belegs und dem Rechnungssteller, schlage die passenden Soll- und Haben-Konten aus der Liste vor.

Berücksichtige bei der Auswahl der Konten:
- Die Art des Geschäftsvorfalls aus der Beschreibung
- Die Branche und Geschäftstätigkeit des Rechnungsstellers, falls bekannt
- Typische Buchungsmuster für diese Art von Unternehmen
- Die Kontonummern und deren Bedeutung im KMU-Kontenrahmen

Wichtig: Schlage die 5 wahrscheinlichsten Konten für Soll und Haben vor, sortiert nach Wahrscheinlichkeit. Antworte ausschließlich im folgenden JSON-Format ohne Kommentare oder zusätzlichen Text:

{
  "debit": [
    {
      "number": string,
      "confidence": number
    }
  ],
  "credit": [
    {
      "number": string,
      "confidence": number
    }
  ]
}

Die confidence muss zwischen 0 und 1 liegen, wobei 1 die höchste Wahrscheinlichkeit darstellt.`;

interface SuggestionResponse {
  debit: Array<{
    number: string;
    confidence: number;
  }>;
  credit: Array<{
    number: string;
    confidence: number;
  }>;
}

export async function suggestAccounts(
  description: string,
  issuer?: string,
  accounts: Account[]
): Promise<SuggestionResponse> {
  try {
    const accountList = accounts.map(a => `${a.number} - ${a.name} (${a.type})`).join('\n');
    
    const requestBody = {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `
Verfügbare Konten:
${accountList}

Beschreibung: ${description}
${issuer ? `
Rechnungssteller: ${issuer}

Berücksichtige die Branche und typische Geschäftsvorfälle dieses Unternehmens bei der Kontierung.
` : ''}

Schlage passende Konten vor.` }
      ],
      temperature: 0.1,
      max_tokens: 500
    };
    
    console.log('Suggestion API request:', requestBody);
    
    const response = await fetch(
      `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': import.meta.env.VITE_AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get suggestions');
    }

    const result = await response.json();
    console.log('Suggestion API response:', result);

    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No suggestion content received');
    }
    
    // Clean the content string
    const cleanContent = content.trim().replace(/```json\n?|\n?```/g, '');

    try {
      // Remove comments and normalize whitespace
      const noComments = cleanContent.replace(/\/\/.*$/gm, '').trim();
      // Remove any trailing commas
      const normalized = noComments.replace(/,(\s*[}\]])/g, '$1');
      
      const suggestion = JSON.parse(normalized);
      
      // Validate suggestion structure
      if (!Array.isArray(suggestion.debit) || !Array.isArray(suggestion.credit)) {
        throw new Error('Invalid suggestion format');
      }
      
      // Ensure numbers are strings and confidence is a number for all suggestions
      suggestion.debit = suggestion.debit.map(d => ({
        number: String(d.number),
        confidence: Number(d.confidence) || 0
      }));
      suggestion.credit = suggestion.credit.map(c => ({
        number: String(c.number),
        confidence: Number(c.confidence) || 0
      }));
      
      // Sort by confidence
      suggestion.debit.sort((a, b) => b.confidence - a.confidence);
      suggestion.credit.sort((a, b) => b.confidence - a.confidence);
      
      console.log('Parsed suggestion:', suggestion);
      return suggestion;
    } catch (parseError) {
      console.error('Failed to parse suggestion response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse account suggestions');
    }

  } catch (error) {
    console.error('Account suggestion failed:', error);
    return {
      debit: [],
      credit: []
    };
  }
}