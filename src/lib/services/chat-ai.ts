import { Message } from './chat';
import { supabase } from '../supabase';

const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
const deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

const SYSTEM_PROMPT = `Sie sind ein Experte für die Analyse von Konversationen. Ihre Aufgabe ist es, einen prägnanten Titel, eine kurze Zusammenfassung und relevante Tags für die Konversation zu erstellen.

Wichtige Hinweise:
- Der Titel soll kurz und aussagekräftig sein (max. 60 Zeichen)
- Die Zusammenfassung soll die wichtigsten Punkte der Konversation enthalten (max. 200 Zeichen)
- Erstellen Sie 1-3 Tags, die die Hauptthemen der Konversation beschreiben
- Tags sollen nur Fachgebiete oder Themen bezeichnen (z.B. "Mehrwertsteuer", "Arbeitsrecht", "Buchhaltung")
- Keine attributiven Tags wie "vertraulich", "dringend" etc.
- Verwenden Sie Schweizer Rechtschreibung (kein "ß", sondern "ss")
- Formulieren Sie sachlich und professionell
- Sprechen Sie den Benutzer direkt an ("Sie haben sich nach..." statt "Der Benutzer sucht...")`;

interface AIResponse {
  title: string;
  summary: string;
  tags: string[];
}

export async function generateTitleAndSummary(messages: Message[]): Promise<AIResponse> {
  // Validate configuration
  if (!endpoint || !apiKey || !deploymentName) {
    console.error('Missing Azure OpenAI configuration');
    throw new Error('Azure OpenAI configuration is incomplete');
  }

  // Filter out empty messages and ensure there are actual messages to analyze
  const validMessages = messages.filter(msg => msg.content.trim());
  if (validMessages.length === 0) {
    return {
      title: 'Neue Konversation',
      summary: 'Eine neue Konversation wurde gestartet.',
      tags: []
    };
  }

  const conversation = validMessages
    .map(msg => `${msg.sender_type === 'user' ? 'Benutzer' : 'Jurata AI'}: ${msg.content}`)
    .join('\n\n');

  try {
    const apiUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analysieren Sie diese Konversation und erstellen Sie einen Titel, eine Zusammenfassung und Tags:

${conversation}

Antworten Sie ausschliesslich im folgenden JSON-Format:

{
  "title": string,  // Kurzer, prägnanter Titel
  "summary": string, // Kurze Zusammenfassung der wichtigsten Punkte
  "tags": string[]  // 1-3 relevante Tags
}`}
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse title and summary');
    }
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    // Return a fallback response
    return {
      title: validMessages[0]?.content?.slice(0, 60) || 'Neue Konversation',
      summary: 'Eine Konversation über verschiedene Themen.',
      tags: []
    };
  }
}

export async function updateConversationMetadata(
  conversationId: string,
  messages: Message[]
): Promise<void> {
  try {
    // Only proceed if we have more than just the welcome message
    if (messages.length <= 1) {
      return;
    }

    const { title, summary, tags } = await generateTitleAndSummary(messages);

    const { error } = await supabase
      .from('conversations')
      .update({
        title,
        metadata: { 
          summary,
          topics: tags
        }
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Failed to update conversation metadata:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update conversation metadata:', error);
    // Don't throw to prevent app crashes
  }
}