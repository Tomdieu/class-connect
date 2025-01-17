import { motion } from "framer-motion";

export const Features = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-900">Principales Fonctionnalités</h2>
      
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
            alt="Gestion des cours"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Gestion des Cours</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Cours Structurés : Des cours bien organisés selon le niveau d'études</li>
              <li>• Supports Multimédias : Vidéos interactives, documents PDF, annales d'examens</li>
              <li>• Mises à Jour Régulières : Contenus pédagogiques actualisés</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Espace Salle de Classe Virtuelle</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Cours en Direct : Sessions de visioconférence en direct</li>
              <li>• Relecture des Cours : Accès aux enregistrements</li>
              <li>• Outils d'Interaction : Chat en direct, questions-réponses</li>
            </ul>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
            alt="Salle de classe virtuelle"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <img 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
            alt="Personnalisation de l'expérience"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Personnalisation de l'Expérience</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Niveaux d'études Disponibles : Collège, Lycée, Université, et Professionnel.</li>
              <li>• Collège : 6ème, 5ème, 4ème, 3ème.</li>
              <li>• Lycée : 2nde, 1ère, Terminale.</li>
              <li>• Université : Niveau I, Niveau II, Niveau III.</li>
              <li>• Professionnel : But personnalisé (exemple : compétences techniques, management, etc.).</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Abonnements Adaptés</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Basic : Accès aux cours de base et supports limités.</li>
              <li>• Standard : Accès à des cours supplémentaires et outils collaboratifs.</li>
              <li>• Premium : Accès complet à tous les cours, aux visioconférences, et aux ressources exclusives.</li>
            </ul>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
            alt="Abonnements adaptés"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <img 
            src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9"
            alt="Paiements sécurisés"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Paiements Sécurisés</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Intégration des paiements mobiles via MTN Money et Orange Money.</li>
              <li>• Notifications instantanées pour les paiements réussis.</li>
              <li>• Gestion facile des abonnements (renouvellements, annulations, etc.).</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Assistance Personnalisée</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Chat en Direct : Un support réactif pour répondre à vos questions.</li>
              <li>• FAQ et Guides : Une base de connaissances complète pour vous accompagner.</li>
            </ul>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
            alt="Assistance personnalisée"
            className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          />
        </div>
      </div>
    </motion.section>
  );
};