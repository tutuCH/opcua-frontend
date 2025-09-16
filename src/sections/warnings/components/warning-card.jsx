import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";
import { 
  AlertCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Factory,
  Cpu
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";
import { demoWarnings } from "src/_mock/demo-warning";

const SEVERITY_LEVEL = {
  "LOW": {
    COLOR: "bg-blue-100 text-blue-800 border-blue-300",
    ICON: <Info className="h-5 w-5 text-blue-500" />,
    BADGE_COLOR: "bg-blue-100 hover:bg-blue-100 text-blue-800"
  },
  "MEDIUM": {
    COLOR: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ICON: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    BADGE_COLOR: "bg-yellow-100 hover:bg-yellow-100 text-yellow-800"
  },
  "HIGH": {
    COLOR: "bg-orange-100 text-orange-800 border-orange-300",
    ICON: <AlertOctagon className="h-5 w-5 text-orange-500" />,
    BADGE_COLOR: "bg-orange-100 hover:bg-orange-100 text-orange-800"
  },
  "CRITICAL": {
    COLOR: "bg-red-100 text-red-800 border-red-300",
    ICON: <AlertCircle className="h-5 w-5 text-red-500" />,
    BADGE_COLOR: "bg-red-100 hover:bg-red-100 text-red-800"
  }
}

const WarningCard = ({ warning }) => {
  const { t } = useTranslation();
  // If no warning is provided, use the first demo warning
  const warningData = warning || demoWarnings[0];
  
  const { COLOR, ICON, BADGE_COLOR } = SEVERITY_LEVEL[warningData.severity] || SEVERITY_LEVEL.MEDIUM;

  return (
    <Card className={`border-l-4 ${COLOR.split(' ')[2]} mb-4 shadow-sm hover:shadow-md transition-shadow h-fit`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {ICON}
            <CardTitle className="text-lg">{t(`warnings.types.${warningData.warning}`)}</CardTitle>
          </div>
          <Badge className={BADGE_COLOR}>
            {t(`warnings.severity.${warningData.severity.toLowerCase()}`)}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-1">
          {warningData.timestamp}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-700">{t(`warnings.types.${warningData.description}`)}</p>
        
        <Accordion type="single" collapsible className="w-full mt-2">
          <AccordionItem value="details" className="border-b-0">
            <AccordionTrigger className="py-2 text-xs text-gray-500 hover:text-gray-700 hover:no-underline">
              {t('warnings.details')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Factory className="h-4 w-4" />
                  <span>{warningData.factory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Cpu className="h-4 w-4" />
                  <span>{warningData.machine}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default WarningCard;