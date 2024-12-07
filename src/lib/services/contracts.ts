import { pdfjs } from 'react-pdf';

const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Azure OpenAI API key");
}

interface ContractParties {
  party1?: {
    name: string;
    type: 'company' | 'individual';
    address?: string;
  };
  party2?: {
    name: string;
    type: 'company' | 'individual';
    address?: string;
  };
  isContract: boolean;
  contractType?: string;
  status?: string;
  signatureDates?: string[];
  summary?: string;
}

const SYSTEM_PROMPT = `Du bist ein Experte für die Analyse von Verträgen. Analysiere den Vertrag und extrahiere die Vertragsparteien.

Wichtig: 
- Verwende Schweizer Rechtschreibung (kein "ß", sondern "ss")
- Berücksichtige ALLE bereitgestellten Seiten des Dokuments bei der Analyse
- Analysiere die Risiken und Klauseln spezifisch aus der Perspektive jeder Vertragspartei
- Formuliere die Analyse für jede Partei individuell und nenne die Partei explizit
- Berücksichtige die spezifische Rolle und Position jeder Partei im Vertrag
- Bewerte die Kritikalität jeder problematischen Klausel auf einer Skala von 1-10 (10 = höchst kritisch)
- Berücksichtige bei der Bewertung:
  - Rechtliche Risiken für die jeweilige Partei
  - Finanzielle Auswirkungen auf die Partei
  - Operationelle Einschränkungen
  - Haftungsrisiken aus Sicht der Partei
  - Wettbewerbsrechtliche Konsequenzen
  - Verhandlungsposition der Partei
  - Ob solche Klauseln marktüblich sind (was sie weniger kritisch macht)
- Konstruiere keine kritischen Klauseln und bewerte die Klauseln spezifisch aus der Sicht der jeweiligen Partei.

Prüfe zuerst, ob es sich überhaupt um einen Vertrag handelt. Falls nicht, setze isContract auf false.

Prüfe für jede Vertragspartei, ob und wann sie unterschrieben hat.

Achte besonders auf:
- Unterschriften und Zeichnungsberechtigte bei Firmen
- Funktionen/Rollen der Unterzeichnenden (z.B. Geschäftsführer, Prokurist)
- Vollständige Namen der Unterzeichnenden

Wenn es sich um einen Vertrag handelt:
- Bestimme den Status (z.B. "Entwurf", "Unterzeichnet", "Gekündigt")
- Erstelle eine sehr kurze inhaltliche Beschreibung (2-5 Wörter) (nicht der reine Vertragstyp)
- Extrahiere alle Unterschriftsdaten
- Erstelle eine kurze Zusammenfassung (2-3 Sätze)`;

const USER_PROMPT = `Analysiere diesen Vertrag und extrahiere die folgenden Informationen als JSON:

{
  "isContract": boolean,       // Ist das Dokument ein Vertrag?
  "redFlagsParty1": [         // Kritische Klauseln und Risiken aus Sicht von Partei 1
    {
      "text": string,         // Originaler Wortlaut der problematischen Klausel
      "explanation": string,  // Erklärung warum diese Klausel für [Name Partei 1] kritisch ist
      "rating": number,       // Kritikalität 1-10 (10 = höchst kritisch)
      "context": string      // Optional: Kontext der Klausel im Vertrag
    }
  ],
  "redFlagsParty2": [         // Kritische Klauseln und Risiken aus Sicht von Partei 2
    {
      "text": string,         // Originaler Wortlaut der problematischen Klausel
      "explanation": string,  // Erklärung warum diese Klausel für [Name Partei 2] kritisch ist
      "rating": number,       // Kritikalität 1-10 (10 = höchst kritisch)
      "context": string      // Optional: Kontext der Klausel im Vertrag
    }
  ],
  "party1": {
console.log('Contract Analysis Response:', jsonResponse); // Log the full API response
  "shortDescription": string, // Kurze inhaltliche Beschreibung (2-5 Wörter) (nicht der reine Vertragstyp)
  "contractType": string,     // Art des Vertrags (z.B. "Kaufvertrag", "Mietvertrag", etc.)
  "summary": string,         // Kurze Zusammenfassung des Vertrags (2-3 Sätze)
  "party1": {                 // Erste Vertragspartei
    "name": string,          // Name der Person oder Firma
    "type": "company" | "individual",
    "address": string,      // Vollständige Adresse wenn vorhanden
    "signatories": [        // Bei Firmen: Unterzeichnende Personen
      {
        "firstName": string,
        "lastName": string,
        "role": string,     // z.B. "Geschäftsführer", "Prokurist"
        "signatureStatus": "signed" | "pending",  // Status der Unterschrift dieser unterzeichnenden Person, Unterschrift muss handschriftlich erfolgt sein 
        "signatureDate": "YYYY-MM-DD"            // Datum der Unterschrift, falls vorhanden
      }],
  },
  "party2": {                 // Zweite Vertragspartei
    "name": string,          // Name der Person oder Firma
    "type": "company" | "individual",
    "address": string,       // Vollständige Adresse wenn vorhanden
    "signatories": [        // Bei Firmen: Unterzeichnende Personen
      {
        "firstName": string,
        "lastName": string,
        "role": string,     // z.B. "Geschäftsführer", "Prokurist"
        "signatureStatus": "signed" | "pending",  // Status der Unterschrift dieser unterzeichnenden Person, Unterschrift muss handschriftlich erfolgt sein 
        "signatureDate": "YYYY-MM-DD"            // Datum der Unterschrift, falls vorhanden
      }],
    "signatureStatus": "signed" | "pending",  // Status der Unterschrift dieser Partei. Stelle sicher, dass die Unterschrift wirklich zu dieser Partei gehört und im für diese Partei vorgesehenen Unterschriftenbereich angebracht ist. Beachte, dass ein Vertrag mehr als 2 Unterschriften erfordern kann. 
    "signatureDate": "YYYY-MM-DD"            // Datum der Unterschrift, falls vorhanden
  }
}

Wichtige Hinweise:
- Setze nicht gefundene Werte auf null
- Bei Einzelpersonen (type: "individual") wird signatories nicht gesetzt
- Bei Firmen (type: "company") versuche immer die Unterzeichnenden zu extrahieren
- Stelle sicher, dass das JSON valide ist
- Analysiere den Vertrag auf kritische Klauseln und fülle das redFlags-Array:
  - Ungewöhnliche oder einseitige Haftungsklauseln
  - Wettbewerbsbeschränkungen
  - Vertragsstrafen und Pönalen
  - Kündigungsfristen und -bedingungen
  - Gerichtsstandsvereinbarungen
  - Preisanpassungsklauseln
  - Exklusivitätsvereinbarungen
  - Gewährleistungsausschlüsse
  - Haftungsbeschränkungen
  - Sicherheitsleistungen
  - Zahlungsbedingungen
  - Geheimhaltungsklauseln

- Bewerte jede kritische Klausel nach folgenden Kriterien:
  - 8-10: Gravierende Risiken (z.B. existenzbedrohende Haftung)
  - 5-7: Kritische Einschränkungen (z.B. lange Bindungsfristen)
  - 1-4: Potenzielle Risiken (z.B. unklare Formulierungen)
- Gib für jede Klausel eine ausführliche Erklärung der spezifischen Risiken für die jeweilige Partei
- Nenne in der Erklärung explizit den Namen/die Bezeichnung der betroffenen Partei
- Berücksichtige die Verhandlungsposition und Marktstellung der jeweiligen Partei
- Gebe ausschließlich das JSON zurück, ohne jegliche Kommentare`;

// File conversion utilities
async function fileToBase64Pages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  const scale = 3.0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport,
      background: 'rgb(255, 255, 255)'
    }).promise;
    
    pages.push(canvas.toDataURL('image/jpeg', 0.95));
  }

  return pages;
}

async function makeAzureRequest(base64Pages: string[]): Promise<string> {
  const content = [
    { type: "text", text: USER_PROMPT },
    ...base64Pages.map((base64) => ({
      type: "image_url",
      image_url: { url: base64 }
    }))
  ];

  const response = await fetch(
    `${endpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content }
        ],
        max_tokens: 4000,
        temperature: 0,
        top_p: 0
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to analyze contract';
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(`API Error: ${errorMessage}`);
  }

  const result = await response.json();
  console.log('Azure API Response:', result);

  if (!result.choices?.[0]?.message?.content) {
    throw new Error("The AI model did not return any content");
  }

  return result.choices[0].message.content.trim();
}

function processExtractedData(jsonStr: string): ContractParties {
  try {
    const cleanJsonStr = jsonStr.replace(/```json\n|\n```/g, '');
    console.log('Cleaned JSON string:', cleanJsonStr);
    const parsedData = JSON.parse(cleanJsonStr);
    console.log('Parsed contract data:', parsedData);

    // Ensure redFlags is always an array
    if (parsedData.redFlags && !Array.isArray(parsedData.redFlags)) {
      parsedData.redFlags = [];
    }

    // Validate red flag ratings
    if (parsedData.redFlags) {
      parsedData.redFlags = parsedData.redFlags.map(flag => ({
        ...flag,
        rating: Math.max(1, Math.min(10, Number(flag.rating) || 1))
      }));
    }
    
    return parsedData;
  } catch (e) {
    console.error('Failed to parse contract data:', e);
    throw new Error('Failed to parse the contract analysis results');
  }
}

export async function analyzeContract(file: File): Promise<ContractParties> {
  try {
    const base64Pages = file.type === 'application/pdf'
      ? await fileToBase64Pages(file)
      : [await fileToBase64(file)];

    const jsonResponse = await makeAzureRequest(base64Pages);
    return processExtractedData(jsonResponse);
  } catch (error) {
    console.error("Contract analysis error:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw error;
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}