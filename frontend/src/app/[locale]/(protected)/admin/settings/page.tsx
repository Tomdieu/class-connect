"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simuler une sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast("Paramètres sauvegardés",{
        description: "Les paramètres ont été mis à jour avec succès.",
      });
    } catch {
      toast("Erreur",{
        description: "Impossible de sauvegarder les paramètres.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto flex flex-col gap-5">
      <h2 className="text-2xl font-bold">Paramètres</h2>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Paramètres Généraux</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du Site</Label>
            <Input id="siteName" defaultValue="ClassConnect" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de Contact</Label>
            <Input id="contactEmail" type="email" />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </Card>

      {/* <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Paramètres de Paiement</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Input id="currency" defaultValue="EUR" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Taux de TVA (%)</Label>
            <Input id="taxRate" type="number" defaultValue="20" />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </Card> */}
    </div>
  );
};

export default SettingsPage