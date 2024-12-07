import { pdfjs } from 'react-pdf';

const endpoint = "https://juratagpt.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21";
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Azure OpenAI API key");
}

interface ExtractedData {
  date: string;
  documentRef?: string;
  description: string;
  amount: number;
  dueDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  currency?: string;
  positions?: Array<{
    description?: string;
    amount: number;
    taxRate?: number;
  }>;
  servicePeriodStart?: string;
  servicePeriodEnd?: string;
  issuer?: {
    company?: string;
    firstName?: string;
    lastName?: string;
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
  };
}

// File conversion utilities
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

async function pdfToBase64Pages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  const scale = 3.0; // Increased from 2.0 for better quality

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

// Azure API interaction
const SYSTEM_PROMPT = `Du bist ein Experte für die Analyse von Schweizer Rechnungen und Belegen. Der Beleg kann mehrere Seiten umfassen.
Analysiere den Beleg sorgfältig und achte besonders auf die korrekte Interpretation von Datumsangaben.

Wichtig: Berücksichtige ALLE bereitgestellten Seiten des Dokuments bei der Analyse.`;

const USER_PROMPT = `Analysiere diesen mehrseitigen Beleg und extrahiere die folgenden Informationen als JSON:

{
  "issuer": {
    "company": "string",      // Firmenname des Rechnungsstellers
    "firstName": "string",    // Vorname der Kontaktperson
    "lastName": "string",     // Nachname der Kontaktperson
    "street": "string",       // Straße und Hausnummer
    "zip": "string",          // Postleitzahl
    "city": "string",         // Ort
    "country": "string"       // Land
  },
  "date": "YYYY-MM-DD",         // Rechnungsdatum
  "documentRef": "string",      // Rechnungs- oder Belegnummer (z.B. RE2024-001)
  "description": "string",      // Kurze Beschreibung des Belegs
  "amount": number,            // Gesamtbetrag als Zahl ohne Währungssymbol
  "dueDate": "YYYY-MM-DD",     // Fälligkeitsdatum
  "paymentTerms": "string",    // Zahlungsfrist (z.B. "30 Tage")
  "taxRate": number,           // MWST-Satz in Prozent
  "currency": "string",        // Währung (z.B. "CHF", "EUR")
  "positions": [               // Optional: Einzelne Positionen
    {
      "description": "string", // Beschreibung der Position
      "amount": number,        // Betrag der Position
      "taxRate": number,      // MWST-Satz der Position
      "currency": "string"    // Währung der Position
    }
  ],
  "servicePeriodStart": "YYYY-MM-DD",  // Beginn der Leistungsperiode
  "servicePeriodEnd": "YYYY-MM-DD"     // Ende der Leistungsperiode
}

Beachte bei der Datumsverarbeitung:
- Berücksichtige verschiedene Schreibweisen und Formate
- Gib ALLE Datumsangaben im Format YYYY-MM-DD zurück

Wichtige Hinweise:
- Berücksichtige alle Seiten des Dokuments bei der Analyse
- Verwende nur die Werte, die du im Beleg findest
- Setze nicht gefundene Werte auf null
- Formatiere Beträge immer als Zahlen ohne Währungssymbol
- Stelle sicher, dass das JSON valide ist
- Gebe ausschließlich das JSON zurück, ohne jegliche Kommentare`;

async function makeAzureRequest(base64Pages: string[]): Promise<string> {
  // Create content array with all pages
  const content = [
    { type: "text", text: USER_PROMPT },
    ...base64Pages.map((base64, index) => ({
      type: "image_url",
      image_url: { url: base64 }
    }))
  ];

  const response = await fetch(endpoint, {
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
      temperature: 1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to process receipt';
    
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
    throw new Error("The AI model did not return any content. Please try again.");
  }

  const extractedContent = result.choices[0].message.content.trim();
  console.log('Extracted content:', extractedContent);
  return extractedContent;
}

function processExtractedData(jsonStr: string): ExtractedData {
  try {
    // Remove any markdown formatting if present
    const cleanJsonStr = jsonStr.replace(/```json\n|\n```/g, '');
    console.log('Cleaned JSON string:', cleanJsonStr);
    const parsedData = JSON.parse(cleanJsonStr);
    console.log('Parsed data:', parsedData);
    
    // Set default values and validate
    const today = new Date().toISOString().split('T')[0];

    // Validate required fields
    if (!parsedData.date) {
      console.warn("No date detected, using today's date");
      parsedData.date = today;
    }

    if (!parsedData.amount && parsedData.amount !== 0) {
      throw new Error("Could not detect a valid amount in the receipt");
    }

    // Set default service period if not provided
    if (!parsedData.servicePeriodStart) {
      parsedData.servicePeriodStart = parsedData.date;
    }
    if (!parsedData.servicePeriodEnd) {
      parsedData.servicePeriodEnd = parsedData.date;
    }

    // Set default due date if not provided
    if (!parsedData.dueDate) {
      const dueDate = new Date(parsedData.date);
      dueDate.setDate(dueDate.getDate() + 30);
      parsedData.dueDate = dueDate.toISOString().split('T')[0];
    }

    return parsedData;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Failed to process receipt: ${e.message}`);
    }
    throw new Error("Failed to parse the receipt data. Please try again.");
  }
}

export async function extractReceiptData(file: File): Promise<ExtractedData> {
  try {
    const base64Pages = file.type === 'application/pdf'
      ? await pdfToBase64Pages(file)
      : [await fileToBase64(file)];

    const jsonResponse = await makeAzureRequest(base64Pages);
    return processExtractedData(jsonResponse);
  } catch (error) {
    console.error("Receipt processing error:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Der Beleg konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut oder laden Sie einen anderen Beleg hoch.");
  }
}