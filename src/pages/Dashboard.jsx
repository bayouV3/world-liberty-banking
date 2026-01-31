import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PortfolioStats from "@/components/PortfolioStats";
import PositionsList from "@/components/PositionsList";
import TradeForm from "@/components/TradeForm";
import PaymentForm from "@/components/PaymentForm";
import PaymentsList from "@/components/PaymentsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Send } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => base44.entities.Position.list()
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-created_date')
  });

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Trade & send payments</p>
        </div>

        <PortfolioStats positions={positions || []} />

        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="trade"><BarChart3 className="w-4 h-4 mr-2" />Trade</TabsTrigger>
            <TabsTrigger value="payments"><Send className="w-4 h-4 mr-2" />Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradeForm positions={positions || []} />
              <PositionsList positions={positions || []} />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentForm user={user} />
              <PaymentsList payments={payments || []} user={user} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}