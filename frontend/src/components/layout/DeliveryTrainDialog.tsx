import { useState } from "react";
import { Loader2, Search, Train } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { searchTrains } from "@/features/trains/services/trainsApi";
import type { ApiTrainSearchResult } from "@/features/trains/types";
import { useDeliveryStore } from "@/store/deliveryStore";
import { getApiErrorMessage } from "@/lib/axios";

export function DeliveryTrainDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [results, setResults] = useState<ApiTrainSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const setTrain = useDeliveryStore((s) => s.setTrain);

  const reset = () => {
    setQuery("");
    setManualNumber("");
    setResults(null);
    setSearchError(null);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const data = await searchTrains(query.trim());
      setResults(data);
    } catch (error) {
      setResults(null);
      setSearchError(getApiErrorMessage(error, "Live train search is temporarily unavailable"));
    } finally {
      setSearching(false);
    }
  };

  const select = (trainNumber: string, trainName: string) => {
    setTrain(trainNumber, trainName);
    toast.success(`Delivery train set to #${trainNumber} â€” ${trainName}`);
    handleOpenChange(false);
  };

  const saveManual = () => {
    const number = manualNumber.trim();
    if (!/^\d{4,5}$/.test(number)) {
      toast.error("Enter a valid 4â€“5 digit train number");
      return;
    }
    setTrain(number);
    toast.success(`Delivery train set to #${number}`);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set your delivery train</DialogTitle>
          <DialogDescription>
            Search for your train to change where we deliver â€” or enter the number directly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Rajdhani or 12345"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        {searchError && (
          <p className="text-xs text-destructive">
            {searchError} â€” enter your train number manually below.
          </p>
        )}

        {results && results.length > 0 && (
          <div className="max-h-56 overflow-y-auto space-y-1.5 border rounded-lg p-1.5">
            {results.map((t) => (
              <button
                key={t.trainNumber}
                type="button"
                onClick={() => select(t.trainNumber, t.trainName)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-accent transition"
              >
                <Train className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{t.trainName}</div>
                  <div className="text-xs text-muted-foreground">
                    #{t.trainNumber} Â· {t.sourceStationCode} â†’ {t.destinationStationCode}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {results && results.length === 0 && (
          <p className="text-xs text-muted-foreground">No trains found for "{query}".</p>
        )}

        <div className="border-t pt-4 space-y-2">
          <Label>Know your train number? Enter it directly</Label>
          <div className="flex gap-2">
            <Input
              value={manualNumber}
              onChange={(e) => setManualNumber(e.target.value)}
              placeholder="e.g. 12345"
              maxLength={5}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={saveManual}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
