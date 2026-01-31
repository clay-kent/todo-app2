import { Star } from "lucide-react";
import { type Priority, PRIORITIES } from "../types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
  value: Priority;
};

const PriorityDisplay: React.FC<Props> = ({ value }) => {
  const n = PRIORITIES[value].value;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <Star className="fill-yellow-500 stroke-0" size={12} />
          </TooltipTrigger>
          <TooltipContent>{PRIORITIES[value].label}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
};
export default PriorityDisplay;
