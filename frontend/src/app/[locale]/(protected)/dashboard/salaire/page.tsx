'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ExternalLink, 
  Euro, 
  FileText, 
  CheckSquare, 
  User,
  X,
  AlertCircle
} from 'lucide-react'

// Define types for payment data
interface Payment {
  date: string;
  student: string;
  course: string;
  hours: string;
  status: 'Payé' | 'Validé' | 'En attente de validation';
  hasInfo?: boolean;
}

export default function PaymentsPage() {
  const [month, setMonth] = useState<string>('Mars 2025')
  const [showSummary, setShowSummary] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("historique")
  
  // Payment status badge styling
  const getBadgeStyle = (status: Payment['status']): string => {
    switch (status) {
      case 'Payé':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'Validé':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'En attente de validation':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }
  
  // Course data
  const payments: Payment[] = [
    { 
      date: '21/03/2025', 
      student: 'TSALATSOUZY Yann (MATHEMATIQUES / PHYSIQUE-CHIMIE - 2NDE)', 
      course: 'Vendredi 21/03/2025 - Durée : 3h00', 
      hours: '3h00', 
      status: 'En attente de validation'
    },
    { 
      date: '19/03/2025', 
      student: 'MBILA Darrell (PHYSIQUE-CHIMIE - 3EME)', 
      course: 'Mercredi 19/03/2025 - Durée : 1h30', 
      hours: '1h00', 
      status: 'Validé',
      hasInfo: true
    },
    { 
      date: '15/03/2025', 
      student: 'MARCHAL Nolan (MATHEMATIQUES / PHYSIQUE-CHIMIE - 4EME)', 
      course: 'Vendredi 14/03/2025 - Durée : 2h00', 
      hours: '2h00', 
      status: 'Payé'
    },
    { 
      date: '12/03/2025', 
      student: 'MBILA Darrell (PHYSIQUE-CHIMIE - 3EME)', 
      course: 'Mercredi 12/03/2025 - Durée : 1h00', 
      hours: '1h00', 
      status: 'Payé'
    },
    { 
      date: '09/03/2025', 
      student: 'MBILA Darrell (PHYSIQUE-CHIMIE - 3EME)', 
      course: 'Samedi 08/03/2025 - Durée : 2h30', 
      hours: '3h00', 
      status: 'Payé',
      hasInfo: true
    },
    { 
      date: '07/03/2025', 
      student: 'MARCHAL Nolan (MATHEMATIQUES / PHYSIQUE-CHIMIE - 4EME)', 
      course: 'Vendredi 07/03/2025 - Durée : 1h30', 
      hours: '1h00', 
      status: 'Payé',
      hasInfo: true
    },
    { 
      date: '06/03/2025', 
      student: 'TSALATSOUZY Yann (MATHEMATIQUES / PHYSIQUE-CHIMIE - 2NDE)', 
      course: 'Jeudi 06/03/2025 - Durée : 2h00', 
      hours: '2h00', 
      status: 'Payé'
    },
    { 
      date: '04/03/2025', 
      student: 'TSALATSOUZY Yann (MATHEMATIQUES / PHYSIQUE-CHIMIE - 2NDE)', 
      course: 'Mardi 04/03/2025 - Durée : 1h30', 
      hours: '1h00', 
      status: 'Payé',
      hasInfo: true
    },
    { 
      date: '03/03/2025', 
      student: 'MBILA Darrell (PHYSIQUE-CHIMIE - 3EME)', 
      course: 'Lundi 03/03/2025 - Durée : 2h00', 
      hours: '2h00', 
      status: 'Payé'
    }
  ]

  // Custom tab component that matches the design
  const TabItem = ({ id, icon, label }: { id: string; icon: React.ReactNode; label: string }) => {
    const isActive = activeTab === id;
    
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
          isActive 
            ? 'border-blue-500 text-blue-600 font-medium' 
            : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'historique':
        return (
          <>
            {/* Period selector */}
            <div className="mb-6 max-w-xs">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mars 2025">Mars 2025</SelectItem>
                  <SelectItem value="Février 2025">Février 2025</SelectItem>
                  <SelectItem value="Janvier 2025">Janvier 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Summary card */}
            {showSummary && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="text-blue-800">10 cours déclarés pour un total de 18h00</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-blue-800 hover:bg-blue-100"
                    onClick={() => setShowSummary(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Payment table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/8">Date déclaration</TableHead>
                    <TableHead className="w-1/3">Élève</TableHead>
                    <TableHead className="w-1/3">Cours</TableHead>
                    <TableHead className="w-1/8">Heure</TableHead>
                    <TableHead className="w-1/8">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <TableCell className="py-3">{payment.date}</TableCell>
                      <TableCell className="py-3">{payment.student}</TableCell>
                      <TableCell className="py-3">{payment.course}</TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        {payment.hours}
                        {payment.hasInfo && (
                          <AlertCircle className="h-4 w-4 text-blue-500 inline ml-1" />
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={getBadgeStyle(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        );
      case 'reglements':
        return <div className="p-4 text-center text-gray-500">Contenu des règlements à venir</div>;
      case 'bulletins':
        return <div className="p-4 text-center text-gray-500">Contenu des bulletins de paie à venir</div>;
      case 'recap':
        return <div className="p-4 text-center text-gray-500">Contenu du récapitulatif annuel à venir</div>;
      case 'attestations':
        return <div className="p-4 text-center text-gray-500">Contenu des attestations employeurs à venir</div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-full">
      <h1 className="text-3xl font-bold mb-6">Mes paiements</h1>
      
      {/* Custom tab navigation that matches the screenshot - with horizontal scrolling */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <div className="flex whitespace-nowrap min-w-max">
          <TabItem 
            id="historique" 
            icon={<ExternalLink className="h-4 w-4" />} 
            label="Historique des cours" 
          />
          <TabItem 
            id="reglements" 
            icon={<Euro className="h-4 w-4" />} 
            label="Règlements" 
          />
          <TabItem 
            id="bulletins" 
            icon={<FileText className="h-4 w-4" />} 
            label="Bulletins de paie" 
          />
          <TabItem 
            id="recap" 
            icon={<CheckSquare className="h-4 w-4" />} 
            label="Récapitulatif annuel" 
          />
          <TabItem 
            id="attestations" 
            icon={<User className="h-4 w-4" />} 
            label="Attestations employeurs" 
          />
        </div>
      </div>
      
      {/* Tab content */}
      {renderTabContent()}
    </div>
  )
}