import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { motion } from "framer-motion";
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  color,
  title,
  description,
  delay = 0
}) => {
  return (
    <RevealOnScroll direction="up" delay={delay}>
      <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="feature-card flex flex-col bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-primary/10 overflow-hidden relative group"
      >
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150"></div>

        <div className={`${color} text-white p-4 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center mb-5 relative z-10`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{title}</h3>
        <p className="text-gray-600 leading-relaxed relative z-10">{description}</p>
      </motion.div>
    </RevealOnScroll>
  );
};

export default FeatureCard;