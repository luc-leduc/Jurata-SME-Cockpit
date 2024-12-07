import { useState, useMemo } from "react";
import { ExternalLink, CreditCard, Percent, X } from "lucide-react";
import { cn } from "@/lib/utils";
import zkbLogo from '@/assets/ZKB.png';
import mobiliarLogo from '@/assets/Mobiliar.png';
import konsentoLogo from '@/assets/Konsento.png';
import bloomRocketLogo from '@/assets/Bloom-Rocket.png';
import fabadviceLogo from '@/assets/Fabadvice.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PartnerOffer {
  title: string;
  company: string;
  description: string;
  discount: string;
  icon?: React.ElementType;
  logo?: string;
  tags: string[];
  price?: string;
  perks?: string[];
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

const offers: PartnerOffer[] = [
  {
    title: "fabadvice",
    company: "Kurs integriertes Online-Marketing",
    description: "Umfassender Online-Kurs für effektives digitales Marketing. Ideal für Gründer und KMU, die ihr Marketing selbst in die Hand nehmen möchten.",
    discount: "20% Rabatt auf den Kurspreis",
    logo: fabadviceLogo,
    tags: ["Marketing", "E-Learning", "Digital"],
    price: "CHF 285",
    perks: ["5-tägige Geld-zurück-Garantie"],
    stats: [
      { value: "100+", label: "Video-Lektionen" },
      { value: "5 Min", label: "Ø Videolänge" }
    ]
  },
  {
    title: "Zürcher Kantonalbank",
    company: "Business Banking",
    description: "Profitieren Sie von attraktiven Konditionen für Ihr Geschäftskonto und persönlicher Beratung.",
    discount: "50% auf die ersten 12 Monate Kontoführung",
    logo: zkbLogo,
    tags: ["Banking", "Finanzierung", "Beratung"]
  },
  {
    title: "Mobiliar",
    company: "Geschäftsversicherung",
    description: "Massgeschneiderte Versicherungslösungen für KMU mit umfassendem Schutz.",
    discount: "15% Rabatt auf alle Versicherungspakete",
    logo: mobiliarLogo,
    tags: ["Versicherung", "Vorsorge", "Schutz"]
  },
  {
    title: "Konsento",
    company: "HR Software",
    description: "Digitalisieren Sie Ihre HR-Prozesse und sparen Sie wertvolle Zeit.",
    discount: "30% Rabatt auf das erste Jahr",
    logo: konsentoLogo,
    tags: ["HR", "Software", "Digitalisierung"]
  },
  {
    title: "Bloom Rocket",
    company: "Marketing Suite",
    description: "All-in-One Marketing-Lösung für erfolgreiche Online-Präsenz.",
    discount: "3 Monate kostenlos testen",
    logo: bloomRocketLogo,
    perks: ["Unbegrenzte Nutzer", "24/7 Support"],
    tags: ["Marketing", "SEO", "Social Media"]
  }
];

export function Marketplace() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get unique tags from all offers
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    offers.forEach(offer => {
      offer.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter offers based on selected tags
  const filteredOffers = useMemo(() => {
    if (selectedTags.size === 0) return offers;
    return offers.filter(offer =>
      offer.tags.some(tag => selectedTags.has(tag))
    );
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Marketplace</h3>
        <p className="text-sm text-muted-foreground">
          Exklusive Angebote unserer Partner für Ihr Unternehmen
        </p>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/50 p-1.5 mb-6">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              "hover:bg-background",
              selectedTags.has(tag)
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {tag}
            {selectedTags.has(tag) && (
              <X className="ml-1 h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 auto-rows-auto">
        {filteredOffers.map((offer) => (
          <Card key={offer.title} className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {offer.company}
                  </CardDescription>
                </div>
                <div className="flex items-center justify-center w-[120px] h-10 shrink-0">
                  <img 
                    src={offer.logo} 
                    alt={offer.title} 
                    className={cn(
                      "h-auto w-auto max-h-full max-w-full object-contain",
                      offer.title === "Bloom Rocket" && "invert dark:invert"
                    )}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {offer.description}
              </p>
              
              {offer.price && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">
                    {offer.price}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-primary">
                <Percent className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {offer.discount}
                </span>
              </div>

              {offer.stats && (
                <div className="grid grid-cols-2 gap-4 py-2">
                  {offer.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {offer.perks && offer.perks.length > 0 && (
                <div className="space-y-2">
                  {offer.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{perk}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {offer.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button 
                className="w-full mt-6" 
                variant="outline"
                onClick={() => window.open('https://www.fabadvice.ch', '_blank')}
              >
                Angebot anzeigen
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}