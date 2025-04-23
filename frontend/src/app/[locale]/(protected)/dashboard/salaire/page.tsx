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
    queryFn: async () => {
      try {
        const response = await getTeacherCourseDeclarations(dateRange);
        // Ensure we always return an array
        return response || [];
      } catch (error) {
        console.error("Error fetching course declarations:", error);
        // Return empty array on error to avoid undefined
        return [];
      }
    }
  });
  
  // Calculate total hours from declarations - no change needed here since we now guarantee
  // declarations to be at least an empty array
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
        return 'bg-primary/10 text-primary hover:bg-primary/10'
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
            ? 'border-primary text-primary font-medium' 
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
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
            <div className="mb-6 w-full max-w-xs">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="bg-card/95 backdrop-blur border-primary/20">
                  <SelectValue>
                    {month === 'all' ? 'Toutes les périodes' : month.charAt(0).toUpperCase() + month.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map((monthOption,index) => (
                    <SelectItem key={index} value={monthOption.value}>
                      {monthOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Summary card */}
            {showSummary && declarations && Array.isArray(declarations) && declarations.length > 0 && (
              <Card className="mb-6 bg-primary/5 border-primary/20 backdrop-blur shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-primary font-medium">
                    {declarations.length} cours déclarés pour un total de {totalHours}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-primary hover:bg-primary/10"
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
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="ml-2 text-muted-foreground">Chargement des déclarations...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <Card className="mb-6 bg-destructive/15 border-destructive/30">
                <CardContent className="p-4">
                  <p className="text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Une erreur s&apos;est produite lors du chargement des déclarations.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Payment table */}
            {!isLoading && !error && declarations && (
              <div className="overflow-x-auto rounded-lg border border-primary/20 shadow-md bg-card/95 backdrop-blur">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date déclaration</TableHead>
                      <TableHead className="whitespace-nowrap">Élève</TableHead>
                      <TableHead className="whitespace-nowrap">Cours</TableHead>
                      <TableHead className="whitespace-nowrap">Heure</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
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
                          <TableRow key={declaration.id} className={index % 2 === 0 ? "bg-white/50" : "bg-white/80"}>
                            <TableCell className="py-3 font-medium">{formattedDate}</TableCell>
                            <TableCell className="py-3 max-w-[200px] sm:max-w-none truncate">
                              {`${studentName || 'Étudiant'} (${subjectName || 'Matière'} - ${className || 'Classe'})`}
                            </TableCell>
                            <TableCell className="py-3 max-w-[200px] sm:max-w-none truncate">
                              {`${formattedDay} - Durée : ${formattedDuration}`}
                            </TableCell>
                            <TableCell className="py-3 whitespace-nowrap">
                              {formattedDuration}
                              {declaration.status === 'ACCEPTED' && declaration.duration % 30 !== 0 && (
                                <AlertCircle className="h-4 w-4 text-primary inline ml-1" />
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
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
        return (
          <Card className="bg-card/95 backdrop-blur border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <Euro className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Contenu des règlements à venir</h3>
              <p>Cette fonctionnalité sera bientôt disponible.</p>
            </CardContent>
          </Card>
        );
      case 'bulletins':
        return (
          <Card className="bg-card/95 backdrop-blur border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Contenu des bulletins de paie à venir</h3>
              <p>Cette fonctionnalité sera bientôt disponible.</p>
            </CardContent>
          </Card>
        );
      case 'recap':
        return (
          <Card className="bg-card/95 backdrop-blur border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <CheckSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Contenu du récapitulatif annuel à venir</h3>
              <p>Cette fonctionnalité sera bientôt disponible.</p>
            </CardContent>
          </Card>
        );
      case 'attestations':
        return (
          <Card className="bg-card/95 backdrop-blur border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Contenu des attestations employeurs à venir</h3>
              <p>Cette fonctionnalité sera bientôt disponible.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-primary">Mes paiements</h1>
          <p className="text-muted-foreground relative z-10">Gérez vos déclarations de cours et vos paiements</p>
        </div>
        
        {/* Custom tab navigation with horizontal scrolling */}
        <div className="mb-6 border-b border-primary/20 overflow-x-auto">
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
        
        {/* Tab content with decoration */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden lg:block"></div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}