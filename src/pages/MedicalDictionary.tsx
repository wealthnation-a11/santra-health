import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medicalTerms, categories } from "@/data/medicalDictionary";

export default function MedicalDictionary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredTerms = useMemo(() => {
    let filtered = medicalTerms;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(query) ||
          term.definition.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((term) => term.category === selectedCategory);
    }

    if (selectedLetter) {
      filtered = filtered.filter((term) =>
        term.term.toUpperCase().startsWith(selectedLetter)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLetter]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof medicalTerms> = {};
    filteredTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat")}
              aria-label="Back to chat"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="text-primary" size={24} />
              <h1 className="text-xl font-semibold">Medical Dictionary</h1>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search medical terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Alphabet Filter */}
          <div className="mt-4 flex flex-wrap gap-1">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() =>
                  setSelectedLetter(selectedLetter === letter ? null : letter)
                }
                className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory || selectedLetter) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {filteredTerms.length} term{filteredTerms.length !== 1 && "s"}{" "}
                found
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-0"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Terms List */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <ScrollArea className="h-[calc(100vh-320px)]">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
              <p>No terms found</p>
              <p className="text-sm mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTerms)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, terms]) => (
                  <div key={letter}>
                    <h2 className="text-2xl font-bold text-primary mb-3 sticky top-0 bg-background py-2">
                      {letter}
                    </h2>
                    <div className="space-y-3">
                      {terms.map((term) => (
                        <Card key={term.term} className="overflow-hidden">
                          <CardHeader className="py-3 px-4">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-lg font-semibold">
                                {term.term}
                              </CardTitle>
                              {term.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {term.category}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="py-2 px-4 pt-0">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {term.definition}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
