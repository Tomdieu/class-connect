'use client'

import { useState, useMemo } from 'react'
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
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherCourseDeclarations } from '@/actions/course-declarations'
import { CourseDeclarationType } from '@/types'
import { format, startOfMonth, endOfMonth, parse } from 'date-fns'
import { fr } from 'date-fns/locale'

// Map status to UI values
const statusMap: Record<string, 'Payé' | 'Validé' | 'En attente de validation'> = {
  'PAID': 'Payé',
  'ACCEPTED': 'Validé',
  'PENDING': 'En attente de validation',
  'REJECTED': 'En attente de validation' // Or any other fallback status
}

export default function PaymentsPage() {
  const [month, setMonth] = useState<string>('all') // Default to 'all' to show all data
  const [showSummary, setShowSummary] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("historique")

  // Calculate date range for the selected month, only if a specific month is selected
  const dateRange = useMemo(() => {
    if (month === 'all') {
      return {}; // Return empty object for no filtering
    }
    
    // Parse the selected month string back to a Date
    const selectedDate = parse(month, 'MMMM yyyy', new Date(), { locale: fr })
    
    // Get the first and last day of the month
    const firstDay = startOfMonth(selectedDate)
    const lastDay = endOfMonth(selectedDate)
    
    return {
      declaration_date_after: format(firstDay, 'yyyy-MM-dd'),
      declaration_date_before: format(lastDay, 'yyyy-MM-dd')
    }
  }, [month])

  // Fetch course declarations using React Query
  const { data: declarations, isLoading, error } = useQuery({
    queryKey: ['courseDeclarations', month],
    queryFn: () => getTeacherCourseDeclarations(dateRange)
  })
  
  // Calculate total hours from declarations
  const totalHours = useMemo(() => {
    // Check if declarations exists and is an array
    if (!declarations || !Array.isArray(declarations)) return '0h00';
    
    const totalMinutes = declarations.reduce((acc, declaration) => {
      return acc + (declaration.duration || 0);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }, [declarations])
  
  // Payment status badge styling
  const getBadgeStyle = (status: 'Payé' | 'Validé' | 'En attente de validation'): string => {
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

  // Generate available months for selection
  const getAvailableMonths = () => {
    const months = [{ value: 'all', label: 'Toutes les périodes' }];
    const currentDate = new Date();
    
    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthStr = format(date, 'MMMM yyyy', { locale: fr });
      months.push({
        value: monthStr,
        label: monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
      });
    }
    
    return months;
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
                  <SelectValue>
                    {month === 'all' ? 'Toutes les périodes' : month.charAt(0).toUpperCase() + month.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map((monthOption) => (
                    <SelectItem key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Summary card */}
            {showSummary && declarations && Array.isArray(declarations) && declarations.length > 0 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="text-blue-800">
                    {declarations.length} cours déclarés pour un total de {totalHours}
                  </p>
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
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Chargement des déclarations...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <Card className="mb-6 bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <p className="text-red-800">
                    Une erreur s&apos;est produite lors du chargement des déclarations.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Payment table */}
            {!isLoading && !error && declarations && (
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
                    {Array.isArray(declarations) && declarations.length > 0 ? (
                      declarations.map((declaration: CourseDeclarationType, index: number) => {
                        const declarationDate = new Date(declaration.declaration_date);
                        const formattedDate = format(declarationDate, 'dd/MM/yyyy');
                        const formattedDay = format(declarationDate, 'EEEE dd/MM/yyyy', { locale: fr });
                        
                        const hours = Math.floor(declaration.duration / 60);
                        const minutes = declaration.duration % 60;
                        const formattedDuration = `${hours}h${minutes.toString().padStart(2, '0')}`;
                        
                        const enrollmentData = declaration.teacher_student_enrollment;
                        const studentName = enrollmentData?.offer?.student?.first_name + ' ' + 
                                           enrollmentData?.offer?.student?.last_name;
                        const subjectName = enrollmentData?.offer?.subject?.name;
                        const className = enrollmentData?.offer?.class_level?.name;
                        
                        const status = statusMap[declaration.status] || 'En attente de validation';
                        
                        return (
                          <TableRow key={declaration.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                            <TableCell className="py-3">{formattedDate}</TableCell>
                            <TableCell className="py-3">
                              {`${studentName || 'Étudiant'} (${subjectName || 'Matière'} - ${className || 'Classe'})`}
                            </TableCell>
                            <TableCell className="py-3">
                              {`${formattedDay} - Durée : ${formattedDuration}`}
                            </TableCell>
                            <TableCell className="py-3 whitespace-nowrap">
                              {formattedDuration}
                              {declaration.status === 'ACCEPTED' && declaration.duration % 30 !== 0 && (
                                <AlertCircle className="h-4 w-4 text-blue-500 inline ml-1" />
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge className={getBadgeStyle(status)}>
                                {status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Aucune déclaration de cours pour cette période
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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